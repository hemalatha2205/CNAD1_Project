package com.logisphere.delivery_service.repository;

import com.logisphere.delivery_service.entity.DeliveryKycAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryKycAuditLogRepository extends JpaRepository<DeliveryKycAuditLog, Long> {
    List<DeliveryKycAuditLog> findByDeliveryPersonIdOrderByCreatedAtDesc(Long deliveryPersonId);
}
