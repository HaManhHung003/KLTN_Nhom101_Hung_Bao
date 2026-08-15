package com.bdspro.service;

import com.bdspro.config.JwtTokenProvider;
import com.bdspro.dto.request.LoginRequest;
import com.bdspro.dto.request.RegisterRequest;
import com.bdspro.dto.response.AuthResponse;
import com.bdspro.entity.User;
import com.bdspro.enums.UserRole;
import com.bdspro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã được sử dụng trong hệ thống.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : UserRole.buyer)
                .verified(request.getRole() == UserRole.buyer) // Buyer tự động verified, Agent cần Admin duyệt
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user);
        return new AuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        String token = tokenProvider.generateToken(user);
        return new AuthResponse(token, user);
    }

    public User getProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng."));
    }

    @Transactional
    public User updateProfile(String userId, String name, String phone, String avatar) {
        User user = getProfile(userId);
        if (name != null && !name.isBlank()) user.setName(name);
        if (phone != null && !phone.isBlank()) user.setPhone(phone);
        if (avatar != null && !avatar.isBlank()) user.setAvatar(avatar);
        return userRepository.save(user);
    }
}
