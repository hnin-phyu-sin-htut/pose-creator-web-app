package com.hpsh.demo.controller;

import com.hpsh.demo.dto.UpdateProfileDto;
import com.hpsh.demo.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

	private final UserProfileService service;

	@GetMapping
	public ResponseEntity<?> getProfile(Authentication auth) {
		return ResponseEntity.ok(service.getProfile(auth.getName()));
	}

	@PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> updateProfile(Authentication auth, @ModelAttribute UpdateProfileDto dto) {
		return ResponseEntity.ok(service.updateProfile(auth.getName(), dto));
	}

	@DeleteMapping
	public ResponseEntity<?> deleteProfile(Authentication auth) {
		service.deleteProfile(auth.getName());
		return ResponseEntity.ok().build();
	}
}