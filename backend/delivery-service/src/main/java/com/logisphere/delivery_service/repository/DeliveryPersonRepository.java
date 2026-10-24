package com.logisphere.delivery_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logisphere.delivery_service.entity.DeliveryPerson;
import com.logisphere.delivery_service.entity.VerificationStatus;

public interface DeliveryPersonRepository
        extends JpaRepository<DeliveryPerson, Long> {

    Optional<DeliveryPerson> findByEmail(String email);

    Optional<DeliveryPerson> findByUserId(Long userId);

    List<DeliveryPerson> findByVerificationStatus(
            VerificationStatus verificationStatus
    );
}
