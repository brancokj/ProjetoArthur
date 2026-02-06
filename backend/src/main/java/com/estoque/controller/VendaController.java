package com.estoque.controller;

import com.estoque.dto.VendaInputDTO;
import com.estoque.model.ItemVenda;
import com.estoque.model.Produto;
import com.estoque.model.Usuario;
import com.estoque.model.Venda;
import com.estoque.repository.VendaRepository;
import com.estoque.repository.ProdutoRepository;
import com.estoque.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    
    @PostMapping
    public ResponseEntity<Void> criarVenda(@RequestBody VendaInputDTO dados) {
        // 1. Cria a Venda e vincula ao Usuário logado
        Venda venda = new Venda();
        venda.setDataVenda(LocalDateTime.now());
        venda.setUsuario((Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        // 2. Converte os itens do DTO para Entidades reais
        List<ItemVenda> itens = dados.itens().stream().map(itemDto -> {
            // Busca o produto pelo ID
            Produto produto = produtoRepository.findById(itemDto.idProduto())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            // Verifica estoque
            if (produto.getQuantidade() < itemDto.quantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            // Cria o item da venda
            ItemVenda item = new ItemVenda();
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setVenda(venda);
            item.setPrecoUnitario(produto.getPreco()); 

            produto.setQuantidade(produto.getQuantidade() - itemDto.quantidade());
            produtoRepository.save(produto);

            return item;
        }).collect(Collectors.toList());

        venda.setItens(itens);
        venda.setValorTotal(itens.stream().mapToDouble(i -> i.getPrecoUnitario() * i.getQuantidade()).sum());
        
        vendaRepository.save(venda);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/todas")
    public List<Map<String, Object>> listarTodasVendas(
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim
    ) {
        List<Venda> vendas;

        if (inicio != null && fim != null) {
            LocalDateTime dataInicio = LocalDate.parse(inicio).atStartOfDay();
            LocalDateTime dataFim = LocalDate.parse(fim).atTime(23, 59, 59);
            vendas = vendaRepository.findByDataVendaBetween(dataInicio, dataFim);
        } else {
            vendas = vendaRepository.findAll();
        }

        if (vendas.isEmpty()) return List.of();

        return vendas.stream().map(venda -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", venda.getId());
            dto.put("dataVenda", venda.getDataVenda());
            dto.put("valorTotal", venda.getValorTotal());

            if (venda.getUsuario() != null) {
                Map<String, String> user = new HashMap<>();
                user.put("email", venda.getUsuario().getEmail());
                dto.put("usuario", user);
            }

            List<Map<String, Object>> itensDto = venda.getItens().stream().map(item -> {
                Map<String, Object> i = new HashMap<>();
                i.put("quantidade", item.getQuantidade());
                i.put("produto", Map.of("nome", item.getProduto().getNome()));
                return i;
            }).collect(Collectors.toList());

            dto.put("itens", itensDto);
            return dto;
        }).collect(Collectors.toList());
    }
}