package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import tutorgo.com.dto.request.UserRegistrationRequest;
import tutorgo.com.dto.response.StudentProfileResponse;
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.enums.RoleName;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.DuplicateResourceException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.UserMapper;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Role;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.RoleRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private TutorRepository tutorRepository;
    @Mock
    private EstudianteRepository estudianteRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private UserRegistrationRequest userRegistrationRequest;
    private Role studentRole;
    private Role tutorRole;
    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        // Para registerUser
        userRegistrationRequest = new UserRegistrationRequest();
        userRegistrationRequest.setNombre("Test User Reg");
        userRegistrationRequest.setEmail("test.reg@example.com");
        userRegistrationRequest.setPassword("password123");
        userRegistrationRequest.setRol(RoleName.ESTUDIANTE);
        userRegistrationRequest.setCentroEstudio("Universidad Test Reg");

        // Para updatePassword y updateUserProfile
        studentRole = new Role(1, RoleName.ESTUDIANTE);
        tutorRole = new Role(2, RoleName.TUTOR);

        user = User.builder()
                .id(1L)
                .nombre("Test User Existing")
                .email("test.existing@example.com")
                .password("encodedPassword")
                .role(studentRole)
                .fotoUrl("http://example.com/old.jpg")
                .build();
        // Simular perfiles para mapeo completo si es necesario
        Estudiante studentProfile = Estudiante.builder().id(1L).user(user).centroEstudio("Centro Estudio Existente").build();
        user.setStudentProfile(studentProfile);

        // UserResponse genérico para algunos mocks
        userResponse = new UserResponse();
        userResponse.setId(1L);
        userResponse.setEmail(user.getEmail()); // Usar email del 'user' de prueba
        userResponse.setNombre(user.getNombre());
        userResponse.setRol(studentRole.getNombre());
        StudentProfileResponse spr = new StudentProfileResponse();
        spr.setId(studentProfile.getId());
        spr.setCentroEstudio(studentProfile.getCentroEstudio());
        userResponse.setStudentProfile(spr);
    }

    // --- Pruebas para registerUser (HU1) ---
    @Test
    void registerUser_Student_Success() {
        // Preparar un UserResponse específico para este caso
        UserResponse specificUserResponse = new UserResponse();
        specificUserResponse.setId(1L);
        specificUserResponse.setEmail(userRegistrationRequest.getEmail());
        specificUserResponse.setNombre(userRegistrationRequest.getNombre());
        specificUserResponse.setRol(RoleName.ESTUDIANTE);
        StudentProfileResponse studentProfileResponse = new StudentProfileResponse();
        studentProfileResponse.setId(1L); // Asumir que el perfil de estudiante también obtiene un ID
        studentProfileResponse.setCentroEstudio(userRegistrationRequest.getCentroEstudio());
        specificUserResponse.setStudentProfile(studentProfileResponse);


        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByNombre(RoleName.ESTUDIANTE)).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPasswordReg");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            // Crear y asignar el perfil de estudiante simulado
            if (u.getRole().getNombre() == RoleName.ESTUDIANTE) {
                Estudiante sp = Estudiante.builder().id(1L).user(u).centroEstudio(userRegistrationRequest.getCentroEstudio()).build();
                u.setStudentProfile(sp);
            }
            return u;
        });
        when(estudianteRepository.save(any(Estudiante.class))).thenAnswer(invocation -> {
            Estudiante e = invocation.getArgument(0);
            e.setId(1L);
            return e;
        });
        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificUserResponse);

        UserResponse result = userService.registerUser(userRegistrationRequest);

        assertNotNull(result);
        assertEquals(userRegistrationRequest.getEmail(), result.getEmail());
        assertEquals(RoleName.ESTUDIANTE, result.getRol());
        assertNotNull(result.getStudentProfile());
        assertEquals(userRegistrationRequest.getCentroEstudio(), result.getStudentProfile().getCentroEstudio());
        verify(userRepository, times(1)).save(any(User.class));
        verify(estudianteRepository, times(1)).save(any(Estudiante.class));
        verify(tutorRepository, never()).save(any(Tutor.class));
    }

    @Test
    void registerUser_Tutor_Success() {
        userRegistrationRequest.setRol(RoleName.TUTOR);
        userRegistrationRequest.setCentroEstudio(null);
        userRegistrationRequest.setTarifaHora(50);
        userRegistrationRequest.setRubro("Matemáticas");

        UserResponse specificUserResponse = new UserResponse();
        specificUserResponse.setId(2L);
        specificUserResponse.setEmail(userRegistrationRequest.getEmail());
        specificUserResponse.setNombre(userRegistrationRequest.getNombre());
        specificUserResponse.setRol(RoleName.TUTOR);
        TutorProfileResponse tutorProfileResponse = new TutorProfileResponse();
        tutorProfileResponse.setId(1L);
        tutorProfileResponse.setTarifaHora(50);
        tutorProfileResponse.setRubro("Matemáticas");
        specificUserResponse.setTutorProfile(tutorProfileResponse);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByNombre(RoleName.TUTOR)).thenReturn(Optional.of(tutorRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPasswordRegTutor");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            if (u.getRole().getNombre() == RoleName.TUTOR) {
                Tutor tp = Tutor.builder().id(1L).user(u).tarifaHora(userRegistrationRequest.getTarifaHora()).rubro(userRegistrationRequest.getRubro()).build();
                u.setTutorProfile(tp);
            }
            return u;
        });
        when(tutorRepository.save(any(Tutor.class))).thenAnswer(invocation -> {
            Tutor t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });
        when(userMapper.userToUserResponse(any(User.class))).thenReturn(specificUserResponse);

        UserResponse result = userService.registerUser(userRegistrationRequest);

        assertNotNull(result);
        assertEquals(RoleName.TUTOR, result.getRol());
        assertNotNull(result.getTutorProfile());
        assertEquals(50, result.getTutorProfile().getTarifaHora());
        verify(userRepository, times(1)).save(any(User.class));
        verify(tutorRepository, times(1)).save(any(Tutor.class));
        verify(estudianteRepository, never()).save(any(Estudiante.class));
    }

    @Test
    void registerUser_EmailAlreadyExists_ThrowsDuplicateResourceException() {
        when(userRepository.existsByEmail(userRegistrationRequest.getEmail())).thenReturn(true);
        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> userService.registerUser(userRegistrationRequest));
        assertEquals("Este correo ya está registrado. Pruebe iniciando sesión.", exception.getMessage());
    }

    @Test
    void registerUser_TutorMissingTarifa_ThrowsBadRequestException() {
        userRegistrationRequest.setRol(RoleName.TUTOR);
        userRegistrationRequest.setTarifaHora(null);
        userRegistrationRequest.setRubro("Matemáticas");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByNombre(RoleName.TUTOR)).thenReturn(Optional.of(tutorRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0)); // Simula el guardado inicial

        BadRequestException exception = assertThrows(BadRequestException.class, () -> userService.registerUser(userRegistrationRequest));
        assertEquals("Para el rol TUTOR, la tarifa por hora y el rubro son obligatorios.", exception.getMessage());
        verify(userRepository, times(1)).delete(any(User.class)); // Verifica que se intenta borrar el usuario
    }
}