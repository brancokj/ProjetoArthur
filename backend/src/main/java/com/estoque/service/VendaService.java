package com.estoque.service;

import com.estoque.exception.NegocioException;
import com.estoque.model.ItemVenda;
import com.estoque.model.Produto;
import com.estoque.model.Usuario;
import com.estoque.model.Venda;
import com.estoque.repository.ProdutoRepository;
import com.estoque.repository.VendaRepository;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Transactional
    public Venda realizarVenda(Venda venda, Usuario usuarioAutenticado) {
        double totalVenda = 0;
        venda.setUsuario(usuarioAutenticado);
        venda.setDataVenda(LocalDateTime.now());

        // --- CORREÇÃO AQUI ---
        // Mudamos de venda.getListaItemVendas() para venda.getItens()
        var itens = venda.getItens(); 
        
        if (itens == null || itens.isEmpty()) {
            throw new NegocioException("Venda deve conter ao menos um item");
        }
        for (ItemVenda item : itens) {
            // 1. Buscar o produto atualizado no banco
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            // 2. Verificar estoque (Regra de Negócio)
            if (produto.getQuantidade() < item.getQuantidade()) {
                throw new NegocioException(
                        "Estoque insuficiente para o produto '" + produto.getNome() +
                                "'. Disponível: " + produto.getQuantidade() +
                                ", Solicitado: " + item.getQuantidade());
            }

            // 3. Baixa no estoque: Nova Qtd = Qtd Atual - Qtd Vendida
            produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
            produtoRepository.save(produto);

            // 4. Calcular totais
            item.setPrecoUnitario(produto.getPreco());
            item.setVenda(venda);
            totalVenda += item.getPrecoUnitario() * item.getQuantidade();
        }

        venda.setValorTotal(totalVenda);
        return vendaRepository.save(venda);
    }
}