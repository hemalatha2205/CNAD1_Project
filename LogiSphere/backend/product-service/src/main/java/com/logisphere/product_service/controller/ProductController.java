package com.logisphere.product_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logisphere.product_service.entity.Product;
import com.logisphere.product_service.repository.ProductRepository;
import com.logisphere.product_service.security.JwtTokenUtil;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${service.auth.url:http://localhost:8081}")
    private String authUrl;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    private ResponseEntity<?> validateProductFields(Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Product name is required."));
        }
        if (product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Product description is required."));
        }
        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Product category is required."));
        }
        if (product.getPrice() == null || product.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Product price must be greater than zero."));
        }
        if (product.getQuantity() == null || product.getQuantity() < 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Product quantity must be non-negative."));
        }
        boolean hasImage = (product.getImageUrl() != null && !product.getImageUrl().trim().isEmpty())
                || (product.getImages() != null && !product.getImages().isEmpty());
        if (!hasImage) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "At least one product image is required."));
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> addProduct(
            @RequestBody Product product,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        ResponseEntity<?> valErr = validateProductFields(product);
        if (valErr != null) return valErr;


        String role = JwtTokenUtil.extractRole(authHeader);
        if ("SUPPLIER".equals(role)) {
            Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);
            if (jwtUserId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            try {
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                if (authHeader != null) headers.set("Authorization", authHeader);
                org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
                ResponseEntity<java.util.Map> response = restTemplate.exchange(
                        authUrl + "/auth/supplier/" + jwtUserId,
                        org.springframework.http.HttpMethod.GET,
                        entity,
                        java.util.Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                java.util.Map profile = response.getBody();
                String status = (String) profile.get("verificationStatus");
                if (!"APPROVED".equalsIgnoreCase(status)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                product.setSupplierId(jwtUserId);
                if (product.getSupplierName() == null || product.getSupplierName().isBlank()) {
                    product.setSupplierName((String) profile.get("businessName"));
                }
                if (product.getAddress() == null || product.getAddress().isBlank()) {
                    product.setAddress((String) profile.get("address"));
                }
                if (product.getCity() == null || product.getCity().isBlank()) {
                    product.setCity((String) profile.get("city"));
                }
                if (product.getLocation() == null || product.getLocation().isBlank()) {
                    product.setLocation((String) profile.get("city"));
                }
                if (product.getState() == null || product.getState().isBlank()) {
                    product.setState((String) profile.get("state"));
                }
                if (product.getLatitude() == null && profile.get("latitude") != null) {
                    product.setLatitude(((Number) profile.get("latitude")).doubleValue());
                }
                if (product.getLongitude() == null && profile.get("longitude") != null) {
                    product.setLongitude(((Number) profile.get("longitude")).doubleValue());
                }
            } catch (Exception e) {
                System.err.println("Supplier verification failed: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!"ADMIN".equals(role)) { // Only ADMIN and SUPPLIER can add
             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        ResponseEntity<?> valErr = validateProductFields(product);
        if (valErr != null) return valErr;

        Product existingProduct = productRepository.findById(id).orElse(null);

        if (existingProduct == null) {
            return ResponseEntity.notFound().build();
        }

        String role = JwtTokenUtil.extractRole(authHeader);
        if ("SUPPLIER".equals(role)) {
            Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);
            if (jwtUserId == null || !jwtUserId.equals(existingProduct.getSupplierId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            product.setSupplierId(jwtUserId); // Maintain ownership
        } else if (!"ADMIN".equals(role)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setImageUrl(product.getImageUrl());
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            existingProduct.setImages(product.getImages());
        }
        if (product.getAddress() != null) existingProduct.setAddress(product.getAddress());
        if (product.getCity() != null) existingProduct.setCity(product.getCity());
        if (product.getLocation() != null) existingProduct.setLocation(product.getLocation());
        if (product.getState() != null) existingProduct.setState(product.getState());
        if (product.getLatitude() != null) existingProduct.setLatitude(product.getLatitude());
        if (product.getLongitude() != null) existingProduct.setLongitude(product.getLongitude());

        // For admin edits, allow supplier info updates
        if ("ADMIN".equals(role)) {
            existingProduct.setSupplierId(product.getSupplierId());
            existingProduct.setSupplierName(product.getSupplierName());
        }

        Product savedProduct = productRepository.save(existingProduct);
        return ResponseEntity.ok(savedProduct);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String name) {
        return ResponseEntity.ok(productRepository.findByNameContainingIgnoreCase(name));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productRepository.findByCategoryIgnoreCase(category));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Product>> getBySupplier(
            @PathVariable Long supplierId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String role = JwtTokenUtil.extractRole(authHeader);
        if ("SUPPLIER".equals(role)) {
            Long jwtUserId = JwtTokenUtil.extractUserId(authHeader);
            if (jwtUserId == null || !jwtUserId.equals(supplierId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        // ADMIN, CUSTOMER, etc can see products by supplier
        return ResponseEntity.ok(productRepository.findBySupplierId(supplierId));
    }
}
