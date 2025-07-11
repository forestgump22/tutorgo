package tutorgo.com.controller;

import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.request.UpdateUserProfileRequest;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.dto.request.UpdatePasswordRequest;
import tutorgo.com.dto.response.ApiResponse;
import tutorgo.com.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse> updateUserPassword(@Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = extractUserEmail(authentication);
        userService.updatePassword(userEmail, updatePasswordRequest);
        return ResponseEntity.ok(new ApiResponse(true, "Contraseña actualizada con éxito."));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse> updateUserProfile(@Valid @RequestBody UpdateUserProfileRequest updateUserProfileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = extractUserEmail(authentication);
        UserResponse updatedUser = userService.updateUserProfile(userEmail, updateUserProfileRequest);
        return ResponseEntity.ok(new ApiResponse(true, "Perfil actualizado correctamente.", updatedUser));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse> deleteCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = extractUserEmail(authentication);
        userService.deleteUserProfile(userEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Tu cuenta ha sido eliminada exitosamente."));
    }

    // Helper para extraer email
    private String extractUserEmail(Authentication authentication) {
        // ... (método extractUserEmail existente) ...
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new org.springframework.security.access.AccessDeniedException("Usuario no autenticado.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal != null) {
            return principal.toString();
        }
        throw new IllegalStateException("No se pudo determinar el email del usuario autenticado desde el principal.");
    }
}