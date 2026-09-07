package com.hgs.service.impl;

import com.hgs.exception.FileStorageException;
import com.hgs.exception.InvalidFileException;
import com.hgs.exception.ResourceNotFoundException;
import com.hgs.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path fileStorageLocation;
    private final long maxFileSizeBytes;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public LocalFileStorageService(
            @Value("${app.storage.upload-dir:./uploads}") String uploadDir,
            @Value("${app.storage.max-file-size-mb:5}") long maxFileSizeMb) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create directory where uploaded files will be stored.", ex);
        }
    }

    @Override
    public boolean isValidImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        if (file.getSize() > maxFileSizeBytes) {
            return false;
        }
        String contentType = file.getContentType();
        return contentType != null && ALLOWED_MIME_TYPES.contains(contentType.toLowerCase());
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Cannot store empty file.");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new InvalidFileException("File exceeds maximum allowed size of " + (maxFileSizeBytes / (1024 * 1024)) + "MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg");
        if (originalFilename.contains("..")) {
            throw new InvalidFileException("Filename contains invalid path sequence: " + originalFilename);
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        } else {
            fileExtension = ".jpg";
        }

        String storedFileName = UUID.randomUUID() + fileExtension;

        try {
            Path targetFolder = this.fileStorageLocation.resolve(subDirectory).normalize();
            if (!Files.exists(targetFolder)) {
                Files.createDirectories(targetFolder);
            }

            Path targetLocation = targetFolder.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/api/media/" + subDirectory + "/" + storedFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + storedFileName + ". Please try again.", ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String filePath) {
        try {
            // Clean incoming filePath and ensure it does not escape base directory
            String normalizedPath = StringUtils.cleanPath(filePath).replace("\\", "/");
            if (normalizedPath.startsWith("/api/media/")) {
                normalizedPath = normalizedPath.substring("/api/media/".length());
            } else if (normalizedPath.startsWith("media/")) {
                normalizedPath = normalizedPath.substring("media/".length());
            }

            Path target = this.fileStorageLocation.resolve(normalizedPath).normalize();
            if (!target.startsWith(this.fileStorageLocation)) {
                throw new InvalidFileException("Access outside upload directory is not permitted.");
            }

            Resource resource = new UrlResource(target.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + filePath);
        }
    }
}
