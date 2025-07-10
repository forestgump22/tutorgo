//package tutorgo.com.service;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import tutorgo.com.dto.request.UpdatePasswordRequest;
//import tutorgo.com.dto.request.UpdateUserProfileRequest;
//import tutorgo.com.dto.request.UserRegistrationRequest;
//import tutorgo.com.dto.response.StudentProfileResponse;
//import tutorgo.com.dto.response.TutorProfileResponse;
//import tutorgo.com.dto.response.UserResponse;
//import tutorgo.com.enums.RoleName;
//import tutorgo.com.exception.BadRequestException;
//import tutorgo.com.exception.DuplicateResourceException;
//import tutorgo.com.exception.ResourceNotFoundException;
//import tutorgo.com.mapper.UserMapper;
//import tutorgo.com.model.Estudiante;
//import tutorgo.com.model.Role;
//import tutorgo.com.model.Tutor;
//import tutorgo.com.model.User;
//import tutorgo.com.repository.EstudianteRepository;
//import tutorgo.com.repository.RoleRepository;
//import tutorgo.com.repository.TutorRepository;
//import tutorgo.com.repository.UserRepository;
//
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.argThat;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class UserServiceImplTest {
//
//    @Mock
//    private UserRepository userRepository;
//    @Mock
//    private RoleRepository roleRepository;
//    @Mock
//    private TutorRepository tutorRepository;
//    @Mock
//    private EstudianteRepository estudianteRepository;
//    @Mock
//    private PasswordEncoder passwordEncoder;
//    @Mock
//    private UserMapper userMapper;
//
//    @InjectMocks
//    private UserServiceImpl userService;
//
//    private UserRegistrationRequest userRegistrationRequest;
//    private UpdatePasswordRequest updatePasswordRequest;
//    private UpdateUserProfileRequest updateUserProfileRequest;
//    private Role studentRole;
//    private Role tutorRole;
//    private User user;
//    private UserResponse userResponse;
//
//    @BeforeEach
//    void setUp() {
//        // Para registerUser
//        userRegistrationRequest = new UserRegistrationRequest();
//        userRegistrationRequest.setNombre("Test User Reg");
//        userRegistrationRequest.setEmail("test.reg@example.com");
//        userRegistrationRequest.setPassword("password123");
//        userRegistrationRequest.setRol(RoleName.ESTUDIANTE);
//        userRegistrationRequest.setCentroEstudio("Universidad Test Reg");
//
//        // Para updatePassword y updateUserProfile
//        studentRole = new Role(1, RoleName.ESTUDIANTE);
//        tutorRole = new Role(2, RoleName.TUTOR);
//
//        user = User.builder()
//                .id(1L)
//                .nombre("Test User Existing")
//                .email("test.existing@example.com")
//                .password("encodedPassword")
//                .role(studentRole)
//                .fotoUrl("http://example.com/old.jpg")
//                .build();
//        // Simular perfiles para mapeo completo si es necesario
//        Estudiante studentProfile = Estudiante.builder().id(1L).user(user).centroEstudio("Centro Estudio Existente").build();
//        user.setStudentProfile(studentProfile);
//
//
//        updatePasswordRequest = new UpdatePasswordRequest();
//        updatePasswordRequest.setCurrentPassword("oldPassword123");
//        updatePasswordRequest.setNewPassword("newPassword456");
//        updatePasswordRequest.setConfirmNewPassword("newPassword456");
//
//        updateUserProfileRequest = new UpdateUserProfileRequest();
//        updateUserProfileRequest.setNombre("Nuevo Nombre Perfil");
//        updateUserProfileRequest.setFotoUrl("http://example.com/nueva_foto_perfil.jpg");
//
//        // UserResponse genérico para algunos mocks
//        userResponse = new UserResponse();
//        userResponse.setId(1L);
//        userResponse.setEmail(user.getEmail()); // Usar email del 'user' de prueba
//        userResponse.setNombre(user.getNombre());
//        userResponse.setRol(studentRole.getNombre());
//        StudentProfileResponse spr = new StudentProfileResponse();
//        spr.setId(studentProfile.getId());
//        spr.setCentroEstudio(studentProfile.getCentroEstudio());
//        userResponse.setStudentProfile(spr);
//    }
//
//    // --- Pruebas para registerUser (HU1) ---
//    @Test
//    void registerUser_Student_Success() {
//        // Preparar un UserResponse específico para este caso
//        UserResponse specificUserResponse = new UserResponse();
//        specificUserResponse.setId(1L);
//        specificUserResponse.setEmail(userRegistrationRequest.getEmail());
//        specificUserResponse.setNombre(userRegistrationRequest.getNombre());
//        specificUserResponse.setRol(RoleName.ESTUDIANTE);
//        StudentProfileResponse studentProfileResponse = new StudentProfileResponse();
//        studentProfileResponse.setId(1L); // Asumir que el perfil de estudiante también obtiene un ID
//        studentProfileResponse.setCentroEstudio(userRegistrationRequest.getCentroEstudio());
//        specificUserResponse.setStudentProfile(studentProfileResponse);
//
//
//        when(userRepository.existsByEmail(anyString())).thenReturn(false);
//        when(roleRepository.findByNombre(RoleName.ESTUDIANTE)).thenReturn(Optional.of(studentRole));
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedPasswordReg");
//        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
//            User u = invocation.getArgument(0);
//            u.setId(1L);
//            // Crear y asignar el perfil de estudiante simulado
//            if (u.getRole().getNombre() == RoleName.ESTUDIANTE) {
//                Estudiante sp = Estudiante.builder().id(1L).user(u).centroEstudio(userRegistrationRequest.getCentroEstudio()).build();
//                u.setStudentProfile(sp);
//            }
//            return u;
//        });
//        when(estudianteRepository.save(any(Estudiante.class))).thenAnswer(invocation -> {
//            Estudiante e = invocation.getArgument(0);
//            e.setId(1L);
//            return e;
//        });
//        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificUserResponse);
//
//        UserResponse result = userService.registerUser(userRegistrationRequest);
//
//        assertNotNull(result);
//        assertEquals(userRegistrationRequest.getEmail(), result.getEmail());
//        assertEquals(RoleName.ESTUDIANTE, result.getRol());
//        assertNotNull(result.getStudentProfile());
//        assertEquals(userRegistrationRequest.getCentroEstudio(), result.getStudentProfile().getCentroEstudio());
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(estudianteRepository, times(1)).save(any(Estudiante.class));
//        verify(tutorRepository, never()).save(any(Tutor.class));
//    }
//
//    @Test
//    void registerUser_Tutor_Success() {
//        userRegistrationRequest.setRol(RoleName.TUTOR);
//        userRegistrationRequest.setCentroEstudio(null);
//        userRegistrationRequest.setTarifaHora(50);
//        userRegistrationRequest.setRubro("Matemáticas"); // Eliminado porque ya no existe el campo rubro
//        tutorProfileResponse.setRubro("Matemáticas"); // Eliminado porque ya no existe el campo rubro
//        TutorProfileResponse tutorProfileResponse = new TutorProfileResponse();
//        tutorProfileResponse.setId(1L);
//        tutorProfileResponse.setTarifaHora(50);
//        tutorProfileResponse.setRubro("Matemáticas");
//        specificUserResponse.setTutorProfile(tutorProfileResponse);
//
//        when(userRepository.existsByEmail(anyString())).thenReturn(false);
//        when(roleRepository.findByNombre(RoleName.TUTOR)).thenReturn(Optional.of(tutorRole));
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedPasswordRegTutor");
//        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
//            User u = invocation.getArgument(0);
//            u.setId(2L);
//            if (u.getRole().getNombre() == RoleName.TUTOR) {
//                Tutor tp = Tutor.builder().id(1L).user(u).tarifaHora(userRegistrationRequest.getTarifaHora())/*.rubro(userRegistrationRequest.getRubro())*/.build(); // Eliminado rubro
//                u.setTutorProfile(tp);
//            }
//            return u;
//        });
//        when(tutorRepository.save(any(Tutor.class))).thenAnswer(invocation -> {
//            Tutor t = invocation.getArgument(0);
//            t.setId(1L);
//            return t;
//        });
//        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificUserResponse);
//
//        UserResponse result = userService.registerUser(userRegistrationRequest);
//
//        assertNotNull(result);
//        assertEquals(RoleName.TUTOR, result.getRol());
//        assertNotNull(result.getTutorProfile());
//        assertEquals(50, result.getTutorProfile().getTarifaHora());
//        verify(userRepository, times(1)).save(any(User.class));
//        verify(tutorRepository, times(1)).save(any(Tutor.class));
//        verify(estudianteRepository, never()).save(any(Estudiante.class));
//    }
//
//    @Test
//    void registerUser_EmailAlreadyExists_ThrowsDuplicateResourceException() {
//        when(userRepository.existsByEmail(userRegistrationRequest.getEmail())).thenReturn(true);
//        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> userService.registerUser(userRegistrationRequest));
//        assertEquals("Este correo ya está registrado. Pruebe iniciando sesión.", exception.getMessage());
//    }
//
//    @Test
//    void registerUser_TutorMissingTarifa_ThrowsBadRequestException() {
//        userRegistrationRequest.setRol(RoleName.TUTOR);
//        userRegistrationRequest.setTarifaHora(null);
//        userRegistrationRequest.setRubro("Matemáticas"); // Eliminado porque ya no existe el campo rubro
//        assertEquals("Para el rol TUTOR, la tarifa por hora y el rubro son obligatorios.", exception.getMessage()); // Actualizar mensaje si es necesario
//        verify(userRepository, times(1)).delete(any(User.class)); // Verifica que se intenta borrar el usuario
//    }
//
//    // --- Pruebas para updatePassword (HU3) ---
//    @Test
//    void updatePassword_Success() {
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), user.getPassword())).thenReturn(true);
//        when(passwordEncoder.matches(updatePasswordRequest.getNewPassword(), user.getPassword())).thenReturn(false);
//        when(passwordEncoder.encode(updatePasswordRequest.getNewPassword())).thenReturn("encodedNewPassword");
//
//        assertDoesNotThrow(() -> userService.updatePassword(user.getEmail(), updatePasswordRequest));
//        verify(userRepository).save(argThat(savedUser -> savedUser.getPassword().equals("encodedNewPassword")));
//    }
//
//    @Test
//    void updatePassword_CurrentPasswordInvalid_ThrowsBadRequestException() {
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), user.getPassword())).thenReturn(false);
//
//        BadRequestException exception = assertThrows(BadRequestException.class, () -> userService.updatePassword(user.getEmail(), updatePasswordRequest));
//        assertEquals("La contraseña actual ingresada es incorrecta.", exception.getMessage());
//    }
//
//    @Test
//    void updatePassword_NewPasswordsDoNotMatch_ThrowsBadRequestException() {
//        updatePasswordRequest.setConfirmNewPassword("nonMatchingPassword");
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), user.getPassword())).thenReturn(true);
//
//        BadRequestException exception = assertThrows(BadRequestException.class, () -> userService.updatePassword(user.getEmail(), updatePasswordRequest));
//        assertEquals("La nueva contraseña y su confirmación no coinciden.", exception.getMessage());
//    }
//
//    @Test
//    void updatePassword_NewPasswordSameAsOld_ThrowsBadRequestException() {
//        updatePasswordRequest.setNewPassword(updatePasswordRequest.getCurrentPassword()); // Hacerla igual
//        updatePasswordRequest.setConfirmNewPassword(updatePasswordRequest.getCurrentPassword());
//
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), user.getPassword())).thenReturn(true);
//        // Simular que la nueva (que es igual a la actual) también matchea
//        when(passwordEncoder.matches(updatePasswordRequest.getNewPassword(), user.getPassword())).thenReturn(true);
//
//
//        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
//            userService.updatePassword(user.getEmail(), updatePasswordRequest);
//        });
//        assertEquals("La nueva contraseña no puede ser igual a la contraseña actual.", exception.getMessage());
//        verify(userRepository, never()).save(any());
//    }
//
//
//    // --- Pruebas para updateUserProfile (HU4) ---
//    @Test
//    void updateUserProfile_Success_UpdatesNameAndFotoUrl() {
//        UserResponse specificResponse = new UserResponse(); // Crear UserResponse específico
//        specificResponse.setId(user.getId());
//        specificResponse.setEmail(user.getEmail());
//        specificResponse.setNombre(updateUserProfileRequest.getNombre());
//        specificResponse.setFotoUrl(updateUserProfileRequest.getFotoUrl());
//        specificResponse.setRol(user.getRole().getNombre());
//        // Añadir perfiles si son necesarios para una respuesta completa del mapper
//        if (user.getStudentProfile() != null) {
//            StudentProfileResponse spr = new StudentProfileResponse();
//            spr.setId(user.getStudentProfile().getId());
//            spr.setCentroEstudio(user.getStudentProfile().getCentroEstudio());
//            specificResponse.setStudentProfile(spr);
//        }
//
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificResponse);
//
//        UserResponse actualResponse = userService.updateUserProfile(user.getEmail(), updateUserProfileRequest);
//
//        assertNotNull(actualResponse);
//        assertEquals(updateUserProfileRequest.getNombre(), actualResponse.getNombre());
//        assertEquals(updateUserProfileRequest.getFotoUrl(), actualResponse.getFotoUrl());
//        verify(userRepository).save(argThat(savedUser ->
//                savedUser.getNombre().equals(updateUserProfileRequest.getNombre()) &&
//                        savedUser.getFotoUrl().equals(updateUserProfileRequest.getFotoUrl())
//        ));
//    }
//
//    @Test
//    void updateUserProfile_Success_UpdatesOnlyName_FotoUrlNullInRequest() {
//        updateUserProfileRequest.setFotoUrl(null); // fotoUrl no se envía
//        String originalFotoUrl = user.getFotoUrl(); // Guardar la foto original
//
//        UserResponse specificResponse = new UserResponse();
//        specificResponse.setId(user.getId());
//        specificResponse.setEmail(user.getEmail());
//        specificResponse.setNombre(updateUserProfileRequest.getNombre());
//        specificResponse.setFotoUrl(originalFotoUrl); // Esperamos que la foto original se mantenga
//        specificResponse.setRol(user.getRole().getNombre());
//        if (user.getStudentProfile() != null) {
//            StudentProfileResponse spr = new StudentProfileResponse();
//            spr.setId(user.getStudentProfile().getId());
//            spr.setCentroEstudio(user.getStudentProfile().getCentroEstudio());
//            specificResponse.setStudentProfile(spr);
//        }
//
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificResponse);
//
//        userService.updateUserProfile(user.getEmail(), updateUserProfileRequest);
//
//        verify(userRepository).save(argThat(savedUser ->
//                savedUser.getNombre().equals(updateUserProfileRequest.getNombre()) &&
//                        (originalFotoUrl == null ? savedUser.getFotoUrl() == null : originalFotoUrl.equals(savedUser.getFotoUrl()))
//        ));
//    }
//
//    @Test
//    void updateUserProfile_Success_ClearsFotoUrl_IfFotoUrlEmptyInRequest() {
//        updateUserProfileRequest.setFotoUrl(""); // Se envía fotoUrl vacía
//
//        UserResponse specificResponse = new UserResponse();
//        specificResponse.setId(user.getId());
//        specificResponse.setEmail(user.getEmail());
//        specificResponse.setNombre(updateUserProfileRequest.getNombre());
//        specificResponse.setFotoUrl(null); // Esperamos que la foto se borre (sea null)
//        specificResponse.setRol(user.getRole().getNombre());
//        if (user.getStudentProfile() != null) {
//            StudentProfileResponse spr = new StudentProfileResponse();
//            spr.setId(user.getStudentProfile().getId());
//            spr.setCentroEstudio(user.getStudentProfile().getCentroEstudio());
//            specificResponse.setStudentProfile(spr);
//        }
//
//        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
//        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificResponse);
//
//        userService.updateUserProfile(user.getEmail(), updateUserProfileRequest);
//
//        verify(userRepository).save(argThat(savedUser ->
//                savedUser.getNombre().equals(updateUserProfileRequest.getNombre()) &&
//                        savedUser.getFotoUrl() == null
//        ));
//    }
//
//    @Test
//    void updateUserProfile_UserNotFound_ThrowsResourceNotFoundException() {
//        when(userRepository.findByEmail("noexiste@example.com")).thenReturn(Optional.empty());
//        assertThrows(ResourceNotFoundException.class, () -> userService.updateUserProfile("noexiste@example.com", updateUserProfileRequest));
//    }
//
//    @Test
//    void deleteUserProfile_Success() {
//        String userEmail = "user.to.delete@example.com";
//        User userToDelete = User.builder().id(10L).email(userEmail).build();
//
//        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(userToDelete));
//        doNothing().when(userRepository).delete(userToDelete);
//        assertDoesNotThrow(() -> userService.deleteUserProfile(userEmail));
//
//        verify(userRepository).findByEmail(userEmail);
//        verify(userRepository).delete(userToDelete);
//    }
//
//    @Test
//    void deleteUserProfile_UserNotFound_ThrowsResourceNotFoundException() {
//        String userEmail = "non.existent.user@example.com";
//        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
//            userService.deleteUserProfile(userEmail);
//        });
//        assertTrue(exception.getMessage().contains("Usuario no encontrado con email: " + userEmail));
//        verify(userRepository, never()).delete(any(User.class));
//    }
//
//    @Test
//    void deleteUserProfile_DeletionFails_ThrowsException() {
//        String userEmail = "user.fail.delete@example.com";
//        User userToFailDelete = User.builder().id(11L).email(userEmail).build();
//
//        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(userToFailDelete));
//        doThrow(new RuntimeException("Error de base de datos simulado durante la eliminación"))
//                .when(userRepository).delete(userToFailDelete);
//
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
//            userService.deleteUserProfile(userEmail);
//        });
//        assertEquals("Error de base de datos simulado durante la eliminación", exception.getMessage());
//        verify(userRepository).delete(userToFailDelete); // Se intentó eliminar
//    }
//
//}