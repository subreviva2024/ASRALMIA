# Notas de Utilização de Ferramentas

## CJ Dropshipping API

### Autenticação
- Token expira a cada 15 dias — renova automaticamente
- Refresh token dura 180 dias
- Rate limit: max 1-4 req/s dependendo do nível da conta
- Todas as chamadas requerem header `CJ-Access-Token`

### Pesquisa de Produtos
- `cj_search_products` — pesquisa por palavra-chave (sempre em INGLÊS)
- `cj_product_detail` — detalhes por PID
- `cj_product_variants` — lista variantes por PID
- Resultados vêm em USD — converter para EUR (×0.92)

### Preços e Envio
- `cj_calculate_pricing` — calcula preço de venda, margem, opportunity score
- `cj_calculate_shipping` — portes para Portugal
- `cj_check_inventory` — verifica stock disponível

### Encomendas
- `cj_create_order` — cria encomenda no CJ
- `cj_order_detail` — detalhes de encomenda por ID
- `cj_track_shipment` — rastreamento com número de tracking

### Categorias
- `cj_list_categories` — lista todas as categorias CJ
- `cj_list_warehouses` — lista armazéns globais

### Dicas
1. Pesquisar SEMPRE em inglês — resultados muito melhores
2. Verificar `productImage` — descartar se inválida
3. Filtrar por preço CJ ≤ $20 USD para margem saudável
4. Envio máximo aceitável: $8 USD para Portugal
5. Opportunity score ≥ 60 = boa oportunidade
6. Score ≥ 80 = excelente — adicionar ao destaque da loja
