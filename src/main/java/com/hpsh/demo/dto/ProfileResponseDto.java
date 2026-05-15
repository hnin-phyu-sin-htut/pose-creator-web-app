package com.hpsh.demo.dto;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponseDto {
	private Long id;
	private String username;
	private String email;
	private String bio;
	private String phone;
	private LocalDate birthday;
	private String profileImage;
}