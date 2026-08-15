package com.bdspro.service;

import com.bdspro.dto.request.AppointmentRequest;
import com.bdspro.entity.Appointment;
import com.bdspro.entity.Property;
import com.bdspro.entity.User;
import com.bdspro.enums.AppointmentStatus;
import com.bdspro.enums.UserRole;
import com.bdspro.repository.AppointmentRepository;
import com.bdspro.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PropertyRepository propertyRepository;

    @Transactional
    public Appointment create(AppointmentRequest request, User buyer) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin BĐS."));

        String coverImg = property.getImages().isEmpty() ? null : property.getImages().get(0).getImageUrl();

        Appointment appointment = Appointment.builder()
                .propertyId(property.getId())
                .propertyTitle(property.getTitle())
                .propertyImage(coverImg)
                .buyerId(buyer.getId())
                .buyerName(buyer.getName())
                .buyerPhone(buyer.getPhone())
                .buyerEmail(buyer.getEmail())
                .agentId(property.getOwnerId())
                .agentName(property.getOwnerName())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .tourType(request.getTourType())
                .note(request.getNote())
                .status(AppointmentStatus.pending)
                .build();

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getMyAppointments(User user) {
        if (user.getRole() == UserRole.agent) {
            return appointmentRepository.findByAgentIdOrderByAppointmentDateDesc(user.getId());
        }
        if (user.getRole() == UserRole.admin) {
            return appointmentRepository.findAll();
        }
        return appointmentRepository.findByBuyerIdOrderByAppointmentDateDesc(user.getId());
    }

    @Transactional
    public Appointment updateStatus(String id, AppointmentStatus status, User user) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lịch hẹn."));

        if (user.getRole() != UserRole.admin &&
                !appointment.getAgentId().equals(user.getId()) &&
                !appointment.getBuyerId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật lịch hẹn này.");
        }

        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}
