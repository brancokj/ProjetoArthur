package com.estoque.controller;

import com.estoque.dto.UsuarioResponseDTO;
import com.estoque.model.Usuario;
import com.estoque.repository.UsuarioRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    public ResponseEntity<Usuario> getMyProfile(@AuthenticationPrincipal Usuario usuario) {
        // O Spring Security injeta o usuário logado automaticamente aqui
        return ResponseEntity.ok(usuario);
    }

    @GetMapping
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }
}