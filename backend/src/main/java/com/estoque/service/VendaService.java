package com.estoque.service;

import com.estoque.exception.NegocioException;
import com.estoque.model.ItemVenda;
import com.estoque.model.Produto;
import com.estoque.model.Usuario;
import com.estoque.model.Venda;
import com.estoque.repository.ProdutoRepository;
import com.estoque.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

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

        // --- CORREÇÃO AQUI: Mudámos de getListaItemVendas() para getItens() ---
        var itens = venda.getItens(); 
        
        if (itens == null || itens.isEmpty()) {
            throw new NegocioException("Venda deve conter ao menos um item");
        }

        for (ItemVenda item : itens) {
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            if (produto.getQuantidade() < item.getQuantidade()) {
                throw new NegocioException(
                        "Estoque insuficiente para '" + produto.getNome() + 
                        "'. Disponível: " + produto.getQuantidade());
            }

            // Baixa de estoque
            produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
            produtoRepository.save(produto);

            // Cálculos e vínculos
            item.setPrecoUnitario(produto.getPreco());
            item.setProdutoNome(produto.getNome()); // Garante o nome histórico
            item.setVenda(venda); // Garante o vínculo pai-filho
            
            totalVenda += item.getPrecoUnitario() * item.getQuantidade();
        }

        venda.setValorTotal(totalVenda);
        return vendaRepository.save(venda);
    }
}