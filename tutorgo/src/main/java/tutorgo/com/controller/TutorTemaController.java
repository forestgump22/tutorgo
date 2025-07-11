package tutorgo.com.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.request.TutorTemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.dto.response.TutorTemaResponse;
import tutorgo.com.service.TutorTemaService;

import java.util.List;

@RestController
@RequestMapping("/tutor-temas")
@RequiredArgsConstructor
public class TutorTemaController {

    private final TutorTemaService tutorTemaService;

    @PostMapping
    public ResponseEntity<TutorTemaResponse> asignarTema(@Valid @RequestBody TutorTemaRequest request) {
        return ResponseEntity.ok(tutorTemaService.asignarTema(request));
    }

    @GetMapping("/{tutorId}")
    public ResponseEntity<List<TutorTemaResponse>> listarTemas(@PathVariable Long tutorId) {
        return ResponseEntity.ok(tutorTemaService.listarTemasPorTutor(tutorId));
    }

    @GetMapping("/tutor/{tutorId}/subtemas")
    public ResponseEntity<List<TutorTemaResponse>> listarSubtemas(@PathVariable Long tutorId) {
        return ResponseEntity.ok(tutorTemaService.listarSubtemasPorTutor(tutorId));
    }

    @GetMapping("/tutor/{tutorId}/tema-principal")
    public ResponseEntity<TemaResponse> obtenerTemaPrincipal(@PathVariable Long tutorId) {
        return ResponseEntity.ok(tutorTemaService.obtenerTemaPrincipalPorTutor(tutorId));
    }

    @DeleteMapping("/{asignacionId}")
    public ResponseEntity<Void> eliminarAsignacion(@PathVariable Long asignacionId) {
        tutorTemaService.eliminarAsignacion(asignacionId);
        return ResponseEntity.noContent().build();
    }
}
