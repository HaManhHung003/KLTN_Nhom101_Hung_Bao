package com.bdspro.repository;

import com.bdspro.entity.Appointment;
import com.bdspro.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByBuyerIdOrderByAppointmentDateDesc(String buyerId);
    List<Appointment> findByAgentIdOrderByAppointmentDateDesc(String agentId);
    List<Appointment> findByPropertyId(String propertyId);
    List<Appointment> findByStatus(AppointmentStatus status);
}
