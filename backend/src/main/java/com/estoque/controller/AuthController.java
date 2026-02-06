package com.estoque.controller;

import com.estoque.dto.LoginDTO;
import com.estoque.dto.RegisterDTO;
import com.estoque.dto.LoginResponseDTO;
import com.estoque.model.Usuario;
import com.estoque.repository.UsuarioRepository;
import com.estoque.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginDTO data) {
        System.out.println("Tentando logar com: " + data.getEmail());
        System.out.println("Senha recebida (texto puro): " + data.getPassword());
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.getEmail(), data.getPassword());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((Usuario) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody RegisterDTO data) {
        if (this.repository.findByEmail(data.getEmail()) != null) {
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.getPassword());
        
        Usuario newUser = new Usuario();
        newUser.setEmail(data.getEmail());
        newUser.setSenha(encryptedPassword);
        newUser.setAdmin(false);
        
        if (data.getDocumento() != null) {
            String doc = data.getDocumento().replaceAll("[^0-9]", "");
            if (doc.length() > 11) newUser.setCnpj(doc);
            else newUser.setCpf(doc);
        }

        this.repository.save(newUser);
        return ResponseEntity.ok().build();
    }
}