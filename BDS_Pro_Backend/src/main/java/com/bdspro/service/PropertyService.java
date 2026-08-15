package com.bdspro.service;

import com.bdspro.dto.request.PropertyCreateRequest;
import com.bdspro.entity.*;
import com.bdspro.enums.ListingStatus;
import com.bdspro.enums.PropertyType;
import com.bdspro.enums.TransactionType;
import com.bdspro.enums.UserRole;
import com.bdspro.repository.FavoriteRepository;
import com.bdspro.repository.PropertyRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final FavoriteRepository favoriteRepository;

    public List<Property> getAll(
            String keyword,
            PropertyType type,
            TransactionType transactionType,
            String district,
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            ListingStatus status,
            String sortBy
    ) {
        Specification<Property> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Mặc định chỉ lấy tin active nếu không lọc status
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(cb.equal(root.get("status"), ListingStatus.active));
            }

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleP = cb.like(cb.lower(root.get("title")), pattern);
                Predicate addressP = cb.like(cb.lower(root.get("address")), pattern);
                Predicate districtP = cb.like(cb.lower(root.get("district")), pattern);
                predicates.add(cb.or(titleP, addressP, districtP));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (transactionType != null) {
                predicates.add(cb.equal(root.get("transactionType"), transactionType));
            }

            if (district != null && !district.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("district")), "%" + district.toLowerCase() + "%"));
            }

            if (city != null && !city.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("aiScore".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "aiScore");
        }

        return propertyRepository.findAll(spec, sort);
    }

    @Transactional
    public Property getById(String id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bất động sản."));

        property.setViewCount(property.getViewCount() + 1);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property create(PropertyCreateRequest request, User owner) {
        Property property = Property.builder()
                .title(request.getTitle())
                .type(request.getType())
                .transactionType(request.getTransactionType())
                .price(request.getPrice())
                .area(request.getArea())
                .legalStatus(request.getLegalStatus())
                .address(request.getAddress())
                .district(request.getDistrict())
                .city(request.getCity() != null ? request.getCity() : "TP. Hồ Chí Minh")
                .latitude(request.getLatitude() != null ? request.getLatitude() : 10.7769)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 106.7009)
                .description(request.getDescription())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .status(ListingStatus.pending) // Chờ Admin duyệt
                .ownerId(owner.getId())
                .ownerName(owner.getName())
                .aiScore(new Random().nextInt(20) + 80)
                .build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<PropertyImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImages().size(); i++) {
                images.add(PropertyImage.builder()
                        .property(property)
                        .imageUrl(request.getImages().get(i))
                        .isCover(i == 0)
                        .displayOrder(i + 1)
                        .build());
            }
            property.setImages(images);
        }

        if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            List<PropertyAmenity> amenities = new ArrayList<>();
            for (String am : request.getAmenities()) {
                amenities.add(PropertyAmenity.builder()
                        .property(property)
                        .amenityName(am)
                        .build());
            }
            property.setAmenities(amenities);
        }

        return propertyRepository.save(property);
    }

    @Transactional
    public Property update(String id, PropertyCreateRequest request, User user) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bất động sản."));

        if (user.getRole() != UserRole.admin && !property.getOwnerId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa tin đăng này.");
        }

        property.setTitle(request.getTitle());
        property.setType(request.getType());
        property.setTransactionType(request.getTransactionType());
        property.setPrice(request.getPrice());
        property.setArea(request.getArea());
        property.setLegalStatus(request.getLegalStatus());
        property.setAddress(request.getAddress());
        property.setDistrict(request.getDistrict());
        property.setDescription(request.getDescription());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());

        return propertyRepository.save(property);
    }

    @Transactional
    public void delete(String id, User user) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bất động sản."));

        if (user.getRole() != UserRole.admin && !property.getOwnerId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa tin đăng này.");
        }

        propertyRepository.delete(property);
    }

    public List<Property> getMyProperties(String ownerId) {
        return propertyRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public boolean toggleFavorite(String userId, String propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bất động sản."));

        if (favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
            property.setFavoriteCount(Math.max(0, property.getFavoriteCount() - 1));
            propertyRepository.save(property);
            return false;
        } else {
            Favorite fav = Favorite.builder()
                    .userId(userId)
                    .property(property)
                    .build();
            favoriteRepository.save(fav);
            property.setFavoriteCount(property.getFavoriteCount() + 1);
            propertyRepository.save(property);
            return true;
        }
    }

    public List<Property> getFavorites(String userId) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return favorites.stream().map(Favorite::getProperty).toList();
    }
}
