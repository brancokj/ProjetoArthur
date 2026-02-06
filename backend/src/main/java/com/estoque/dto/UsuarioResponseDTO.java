package com.estoque.dto;

import com.estoque.model.Usuario;

public record UsuarioResponseDTO(Long id, String email, String cpf, String cnpj, boolean admin) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(usuario.getId(), usuario.getEmail(), usuario.getCpf(), usuario.getCnpj(), usuario.isAdmin());
    }
}