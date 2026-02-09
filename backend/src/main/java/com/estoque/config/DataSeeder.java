package com.estoque.config;

import com.estoque.model.Funcionario;
import com.estoque.model.Produto;
import com.estoque.model.Usuario;
import com.estoque.repository.FuncionarioRepository;
import com.estoque.repository.ProdutoRepository;
import com.estoque.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@Configuration
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // --- 1. SEED DE USUÁRIOS (COM TELEFONE) ---
        if (usuarioRepository.findByEmail("cliente@gmail.com") == null) {
            Usuario cliente = new Usuario();
            cliente.setNome("Cliente Padrão");
            cliente.setEmail("cliente@gmail.com");
            cliente.setTelefone("(11) 99999-1010"); // <--- NOVO
            cliente.setCpf("111.111.111-11");
            cliente.setEndereco("Rua dos Clientes, 100 - Centro");
            cliente.setCep("12345678");
            cliente.setAdmin(false);
            cliente.setSenha(passwordEncoder.encode("123456"));
            usuarioRepository.save(cliente);
            System.out.println("✅ Usuário Cliente criado com telefone.");
        }

        if (usuarioRepository.findByEmail("admin@estoque.com") == null) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador Master");
            admin.setEmail("admin@estoque.com");
            admin.setTelefone("(11) 98888-2020"); // <--- NOVO
            admin.setCpf("000.000.000-00");
            admin.setEndereco("Centro de Distribuição");
            admin.setCep("87654321");
            admin.setAdmin(true);
            admin.setSenha(passwordEncoder.encode("123456"));
            usuarioRepository.save(admin);
            System.out.println("✅ Usuário Admin criado com telefone.");
        }

        // --- 2. SEED DE PRODUTOS ---
        if (produtoRepository.count() == 0) {
            Produto p1 = new Produto();
            p1.setNome("Notebook Gamer Dell G15");
            p1.setDescricao("Notebook potente com RTX 3050 e 16GB RAM");
            p1.setPreco(4500.00);
            p1.setQuantidade(10); 
            p1.setCategoria("Informática");

            Produto p2 = new Produto();
            p2.setNome("Mouse Sem Fio Logitech");
            p2.setDescricao("Mouse ergonômico silencioso");
            p2.setPreco(120.50);
            p2.setQuantidade(50);
            p2.setCategoria("Acessórios");

            Produto p3 = new Produto();
            p3.setNome("Subwoofer Automotivo Pioneer");
            p3.setDescricao("Grave potente para instalação em carros");
            p3.setPreco(650.00);
            p3.setQuantidade(5);
            p3.setCategoria("Automotivo");

            produtoRepository.saveAll(Arrays.asList(p1, p2, p3));
            System.out.println("✅ Produtos de teste cadastrados!");
        }

        // --- 3. SEED DE FUNCIONÁRIOS (EQUIPE TÉCNICA) ---
        if (funcionarioRepository.count() == 0) {
            Funcionario f1 = new Funcionario();
            f1.setNome("Carlos Técnico (Som)");
            
            Funcionario f2 = new Funcionario();
            f2.setNome("Roberto Instalador");
            
            Funcionario f3 = new Funcionario();
            f3.setNome("Fernanda Eletricista");

            funcionarioRepository.saveAll(Arrays.asList(f1, f2, f3));
            System.out.println("✅ Equipe técnica cadastrada com sucesso!");
        }
    }
}