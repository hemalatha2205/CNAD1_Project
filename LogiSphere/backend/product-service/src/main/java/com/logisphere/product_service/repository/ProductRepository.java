package com.logisphere.product_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logisphere.product_service.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findBySupplierId(Long supplierId);
}
