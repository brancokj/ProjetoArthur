package com.estoque.dto;

import com.estoque.model.Usuario;

public record UsuarioResponseDTO(Long id, String nome, String email, String telefone, String cpf, String cnpj, boolean admin) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(
            usuario.getId(), 
            usuario.getNome(), 
            usuario.getEmail(),
            usuario.getTelefone(), // <--- ENVIA O TELEFONE PARA O FRONT
            usuario.getCpf(), 
            usuario.getCnpj(), 
            usuario.isAdmin()
        );
    }
}