package com.estoque.controller;

import com.estoque.dto.UsuarioResponseDTO;
import com.estoque.model.Usuario;
import com.estoque.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Listar todos (Admin)
    @GetMapping
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    // Pegar dados do usuário logado
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getMe(@AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }

    // --- NOVO: ATUALIZAR PERFIL ---
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarUsuario(@PathVariable Long id, @RequestBody Map<String, String> dados, @AuthenticationPrincipal Usuario usuarioLogado) {
        
        // Segurança: O usuário só pode editar a si mesmo (a menos que seja Admin)
        if (!usuarioLogado.getId().equals(id) && !usuarioLogado.isAdmin()) {
            return ResponseEntity.status(403).body("Sem permissão para editar este perfil.");
        }

        return usuarioRepository.findById(id).map(usuario -> {
            // Atualiza campos permitidos
            if (dados.containsKey("nome")) usuario.setNome(dados.get("nome"));
            if (dados.containsKey("email")) usuario.setEmail(dados.get("email"));
            if (dados.containsKey("telefone")) usuario.setTelefone(dados.get("telefone"));
            if (dados.containsKey("endereco")) usuario.setEndereco(dados.get("endereco"));
            if (dados.containsKey("cep")) usuario.setCep(dados.get("cep"));
            
            // Se enviaram senha nova, criptografa e salva
            if (dados.containsKey("senha") && !dados.get("senha").isEmpty()) {
                usuario.setSenha(passwordEncoder.encode(dados.get("senha")));
            }

            // OBS: NÃO ATUALIZAMOS O CPF AQUI (Mantemos o original)

            usuarioRepository.save(usuario);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}