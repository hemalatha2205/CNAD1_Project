package com.logisphere.order_service.repository;

import com.logisphere.order_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findDistinctByItemsProductIdIn(List<Long> productIds);
}
