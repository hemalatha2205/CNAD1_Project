package com.logisphere.auth_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logisphere.auth_service.entity.SupplierProfile;

public interface SupplierProfileRepository
        extends JpaRepository<SupplierProfile, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT s FROM SupplierProfile s WHERE s.user.id = :userId")
    Optional<SupplierProfile> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    java.util.List<SupplierProfile> findByVerificationStatus(String verificationStatus);
}
