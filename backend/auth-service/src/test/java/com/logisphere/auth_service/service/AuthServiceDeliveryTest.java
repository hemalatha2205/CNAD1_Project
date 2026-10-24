package com.logisphere.auth_service.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.logisphere.auth_service.client.DeliveryClient;
import com.logisphere.auth_service.dto.DeliveryRegistrationRequest;
import com.logisphere.auth_service.entity.Role;
import com.logisphere.auth_service.entity.User;
import com.logisphere.auth_service.repository.SupplierProfileRepository;
import com.logisphere.auth_service.repository.UserRepository;
import com.logisphere.auth_service.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceDeliveryTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SupplierProfileRepository supplierProfileRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private DeliveryClient deliveryClient;

    private AuthService authService;

    private static final String VALID_PASSWORD = "StrongPassword@2026!";

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                supplierProfileRepository,
                jwtService,
                deliveryClient
        );
    }

    @Test
    void testRegister_DeliveryPerson_InvokesDeliveryClient() {
        when(userRepository.existsByEmailIgnoreCase("delivery@test.com")).thenReturn(false);
        when(passwordEncoder.encode(VALID_PASSWORD)).thenReturn("encoded_pass");

        User savedUser = new User("Delivery Guy", "delivery@test.com", "encoded_pass", "123456", Role.DELIVERY_PERSON);
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register("Delivery Guy", "delivery@test.com", VALID_PASSWORD, "123456", Role.DELIVERY_PERSON);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(deliveryClient, times(1)).provisionDeliveryProfile(10L, "Delivery Guy", "delivery@test.com", "123456");
    }

    @Test
    void testRegister_Customer_DoesNotInvokeDeliveryClient() {
        when(userRepository.existsByEmailIgnoreCase("cust@test.com")).thenReturn(false);
        when(passwordEncoder.encode(VALID_PASSWORD)).thenReturn("encoded_pass");

        User savedUser = new User("Customer Guy", "cust@test.com", "encoded_pass", "123456", Role.CUSTOMER);
        savedUser.setId(2L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register("Customer Guy", "cust@test.com", VALID_PASSWORD, "123456", Role.CUSTOMER);

        assertNotNull(result);
        verify(deliveryClient, never()).provisionDeliveryProfile(any(), any(), any(), any());
    }

    @Test
    void testRegisterDeliveryPerson_FullKyc_Success() {
        DeliveryRegistrationRequest req = new DeliveryRegistrationRequest();
        req.setFullName("Kyc Driver");
        req.setEmail("kycdriver@test.com");
        req.setPassword(VALID_PASSWORD);
        req.setPhone("+919988776655");
        req.setAddress("123 Delivery Road");
        req.setCity("Bengaluru");
        req.setDateOfBirth(LocalDate.now().minusYears(24));
        req.setDrivingLicenseExpiryDate(LocalDate.now().plusYears(4));

        when(userRepository.existsByEmailIgnoreCase("kycdriver@test.com")).thenReturn(false);
        when(passwordEncoder.encode(VALID_PASSWORD)).thenReturn("encoded_pass");

        User savedUser = new User("Kyc Driver", "kycdriver@test.com", "encoded_pass", "+919988776655", Role.DELIVERY_PERSON);
        savedUser.setId(15L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.registerDeliveryPerson(req);

        assertNotNull(result);
        assertEquals(15L, result.getId());
        assertEquals(Role.DELIVERY_PERSON, result.getRole());
        verify(deliveryClient, times(1)).provisionFullDeliveryProfile(eq(15L), eq(req));
    }

    @Test
    void testRegisterDeliveryPerson_AgeUnder18_ThrowsException() {
        DeliveryRegistrationRequest req = new DeliveryRegistrationRequest();
        req.setFullName("Minor Driver");
        req.setEmail("minor@test.com");
        req.setPassword(VALID_PASSWORD);
        req.setPhone("+919988776655");
        req.setAddress("123 Minor Road");
        req.setCity("Bengaluru");
        req.setDateOfBirth(LocalDate.now().minusYears(17));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.registerDeliveryPerson(req));
        assertTrue(ex.getMessage().contains("at least 18 years of age"));
    }

    @Test
    void testRegisterDeliveryPerson_ExpiredLicense_ThrowsException() {
        DeliveryRegistrationRequest req = new DeliveryRegistrationRequest();
        req.setFullName("Expired Driver");
        req.setEmail("expired@test.com");
        req.setPassword(VALID_PASSWORD);
        req.setPhone("+919988776655");
        req.setAddress("123 Road");
        req.setCity("Bengaluru");
        req.setDateOfBirth(LocalDate.now().minusYears(25));
        req.setDrivingLicenseExpiryDate(LocalDate.now().minusDays(1));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.registerDeliveryPerson(req));
        assertTrue(ex.getMessage().contains("Driving licence has expired"));
    }

    @Test
    void testLogin_DeliveryPerson_InvokesDeliveryClient() {
        User user = new User("Delivery Guy", "delivery@test.com", "encoded_pass", "123456", Role.DELIVERY_PERSON);
        user.setId(10L);

        when(userRepository.findByEmailIgnoreCase("delivery@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded_pass")).thenReturn(true);
        when(jwtService.generateToken(10L, "delivery@test.com", "DELIVERY_PERSON")).thenReturn("dummy_token");

        var response = authService.login("delivery@test.com", "password");

        assertNotNull(response);
        assertEquals("dummy_token", response.getToken());
        verify(deliveryClient, times(1)).provisionDeliveryProfile(10L, "Delivery Guy", "delivery@test.com", "123456");
    }
}
