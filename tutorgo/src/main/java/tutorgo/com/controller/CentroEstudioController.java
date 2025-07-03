package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tutorgo.com.dto.response.CentroEstudioResponse;
import tutorgo.com.service.CentroEstudioService;

import java.util.List;

@RestController
@RequestMapping("/centros-estudio")
@RequiredArgsConstructor
public class CentroEstudioController {

    private final CentroEstudioService centroEstudioService;

    @GetMapping
    public ResponseEntity<List<CentroEstudioResponse>> getAll() {
        List<CentroEstudioResponse> centros = centroEstudioService.getAllCentrosEstudio();
        if (centros.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(centros);
    }
}