package com.hpsh.demo.dto;

import java.time.LocalDate;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateProfileDto {

	private String username;
	private String bio;
	private String phone;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate birthday;

	private MultipartFile profileImageFile;
}