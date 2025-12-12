//package com.propmanagment.backend.repository;
//
//import com.propmanagment.backend.model.ServiceProvider;
//import org.springframework.data.jpa.repository.JpaRepository;
//import java.util.List;
//import java.util.Optional;
//
//public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
//
//    List<ServiceProvider> findByCategoryId(Long categoryId);
//
//    List<ServiceProvider> findByCategoryIdAndCityIgnoreCase(Long categoryId, String city);
//    Optional<ServiceProvider> findByEmail(String email);
//    boolean existsByEmail(String email);
//}
package com.propmanagment.backend.repository;

import com.propmanagment.backend.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    boolean existsByEmail(String email);

    Optional<ServiceProvider> findByEmail(String email);

    List<ServiceProvider> findByCategoryId(Long categoryId);

    List<ServiceProvider> findByCategoryIdAndCityIgnoreCase(Long categoryId, String city);
}
