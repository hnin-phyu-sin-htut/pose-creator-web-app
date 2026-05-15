package com.hpsh.demo.service;

import com.hpsh.demo.dao.UserDao;
import com.hpsh.demo.dto.ProfileResponseDto;
import com.hpsh.demo.dto.UpdateProfileDto;
import com.hpsh.demo.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class UserProfileService {

	private final UserDao userDao;

	public ProfileResponseDto getProfile(String identifier) {
		return mapToDto(findUser(identifier));
	}

	public ProfileResponseDto updateProfile(String identifier, UpdateProfileDto dto) {

		User user = findUser(identifier);

		if (dto.getUsername() != null)
			user.setUsername(dto.getUsername());

		if (dto.getBio() != null)
			user.setBio(dto.getBio());

		if (dto.getPhone() != null)
			user.setPhone(dto.getPhone());

		if (dto.getBirthday() != null)
			user.setBirthday(dto.getBirthday());

		if (dto.getProfileImageFile() != null && !dto.getProfileImageFile().isEmpty()) {
			try {
				String uploadDirPath = System.getProperty("user.dir") + "/upload-profile/";
				File uploadDir = new File(uploadDirPath);

				if (!uploadDir.exists()) {
					uploadDir.mkdirs();
				}

				String fileName = System.currentTimeMillis() + "_" + dto.getProfileImageFile().getOriginalFilename();

				File file = new File(uploadDir, fileName);
				dto.getProfileImageFile().transferTo(file);

				user.setProfileImage("/upload-profile/" + fileName);

			} catch (Exception e) {
				throw new RuntimeException("Image upload failed: " + e.getMessage());
			}
		}

		return mapToDto(userDao.save(user));
	}

	public void deleteProfile(String identifier) {
		User user = findUser(identifier);
		userDao.delete(user);
	}

	private User findUser(String identifier) {
		return userDao.findByUsername(identifier).or(() -> userDao.findByEmail(identifier))
				.orElseThrow(() -> new RuntimeException("User not found."));
	}

	private ProfileResponseDto mapToDto(User user) {
		return ProfileResponseDto.builder().id(user.getId()).username(user.getUsername()).email(user.getEmail())
				.bio(user.getBio()).phone(user.getPhone()).birthday(user.getBirthday())
				.profileImage(user.getProfileImage()).build();
	}
}