package com.bdspro.repository;

import com.bdspro.entity.Property;
import com.bdspro.enums.ListingStatus;
import com.bdspro.enums.PropertyType;
import com.bdspro.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, String>, JpaSpecificationExecutor<Property> {
    List<Property> findByStatus(ListingStatus status);
    List<Property> findByOwnerId(String ownerId);
    List<Property> findByCityAndDistrict(String city, String district);
    List<Property> findByTypeAndTransactionType(PropertyType type, TransactionType transactionType);
    long countByStatus(ListingStatus status);
}
