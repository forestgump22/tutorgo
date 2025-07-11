package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.request.TemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.service.TemaService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/temas")
@RequiredArgsConstructor
public class TemaController {

    private final TemaService temaService;

    @PostMapping
    public ResponseEntity<TemaResponse> crearTema(@Valid @RequestBody TemaRequest request) {
        return ResponseEntity.ok(temaService.crearTema(request));
    }

    @GetMapping
    public ResponseEntity<List<TemaResponse>> listarTemasJerarquicos() {
        return ResponseEntity.ok(temaService.obtenerTemasJerarquicos());
    }

    @GetMapping("/principales")
    public ResponseEntity<List<TemaResponse>> listarTemasPrincipales() {
        return ResponseEntity.ok(temaService.obtenerTemasPrincipales());
    }

    @GetMapping("/{temaId}/subtemas")
    public ResponseEntity<List<TemaResponse>> listarSubtemas(@PathVariable Long temaId) {
        return ResponseEntity.ok(temaService.obtenerSubtemasPorTema(temaId));
    }
}
