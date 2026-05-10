package com.hpsh.demo.service;

import com.hpsh.demo.dao.UserDao;
import com.hpsh.demo.dto.AuthResponseDto;
import com.hpsh.demo.dto.LoginDto;
import com.hpsh.demo.dto.RegisterDto;
import com.hpsh.demo.exception.AppException;
import com.hpsh.demo.model.User;
import com.hpsh.demo.security.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDao userDao;
    private final JwtUtil jwtUtil;

    public AuthService(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       UserDao userDao, JwtUtil jwtUtil) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDto login(LoginDto dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.username(), dto.password()));
        } catch (BadCredentialsException e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }
        User user = userDao.findByUsernameOrEmail(dto.username(), dto.username())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        return new AuthResponseDto(token, user.getUsername(), user.getId());
    }

    @Transactional
    public AuthResponseDto register(RegisterDto dto) {
        if (userDao.existsByUsername(dto.username())) {
            throw new AppException(HttpStatus.CONFLICT, "Username already exists.");
        }
        if (userDao.existsByEmail(dto.email())) {
            throw new AppException(HttpStatus.CONFLICT, "Email already registered.");
        }
        User user = User.builder()
                .username(dto.username())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .build();
        user = userDao.save(user);
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        return new AuthResponseDto(token, user.getUsername(), user.getId());
    }
}
