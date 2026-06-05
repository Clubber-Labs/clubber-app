# Contrato backend — Recibos de mensagem (enviado / entregue / lido)

O app já implementa os checks de status no chat (⧖ enviando · ✓ enviado · ✓✓
entregue · ✓✓ azul lido). O lado do app **degrada sozinho**: enquanto o backend
não expõe o que está abaixo, a mensagem fica em "enviado" (✓) e o "lido" só
atualiza quando a conversa é recarregada. Para acender "entregue" e o tempo real,
o backend precisa implementar os 4 pontos a seguir.

Modelo: **watermark por participante**. Em vez de status por mensagem, cada
participante tem dois carimbos de tempo na conversa. Uma mensagem `M` está:

- **entregue** para o participante `P` se `P.lastDeliveredAt >= M.createdAt`
- **lida** por `P` se `P.lastReadAt >= M.createdAt`

Em DM, "todos os outros" = o outro participante. Em grupo, a mensagem só vira
✓✓/azul quando **todos** os outros atingiram o watermark (o app usa `every`).

---

## 1. Campo novo no participante — `GET /conversations/:id`

Cada item de `participants` passa a devolver **`lastDeliveredAt`** (além do
`lastReadAt` que já existe). ISO 8601 ou `null`.

```jsonc
{
  "id": "conv-uuid",
  "type": "DIRECT",
  "participants": [
    {
      "userId": "user-uuid",
      "role": "MEMBER",
      "user": { "...": "..." },
      "lastReadAt": "2026-06-05T12:30:00.000Z",
      "lastDeliveredAt": "2026-06-05T12:31:10.000Z"  // NOVO
    }
  ]
}
```

> Watermark é **monotônico**: nunca retrocede. `lastReadAt` implica entregue, ou
> seja, ao avançar `lastReadAt` avance também `lastDeliveredAt` se estiver atrás.

---

## 2. Endpoint novo — confirmar ENTREGA

```
POST /conversations/:id/delivered
Authorization: Bearer <jwt>
→ 204 No Content
```

Avança o `lastDeliveredAt` do **usuário autenticado** nessa conversa para `now()`
(ou para o `createdAt` da última mensagem que ele ainda não tinha recebido — o
mais simples é `now()`). Deve emitir o frame WS `delivered` (seção 4) para os
**outros** participantes.

O app chama isso automaticamente ao **receber** uma mensagem de outro pelo
WebSocket com a conversa **fechada** (ver `useChatRealtime`). Idempotente: chamar
repetido só reavança o watermark.

> Já existe `POST /conversations/:id/read` (marca leitura). Ele deve, além de
> `lastReadAt = now()`, garantir `lastDeliveredAt >= now()` e emitir o frame `read`
> (e, se o entregue avançou junto, opcionalmente `delivered`).

---

## 3. Marcar entrega no envio pelo WS (recomendado)

Quando o servidor entrega um frame `message` via socket e o destinatário está
conectado, o servidor **já sabe** que entregou. O ideal é o próprio servidor
avançar o `lastDeliveredAt` do destinatário nesse momento e emitir o `delivered`
para o remetente — sem depender do ack do app. O ack do app (seção 2) é o
fallback confiável para quando isso não for feito server-side.

---

## 4. Frames novos no WebSocket — `GET /ws/chat`

Emitidos para os **outros** participantes da conversa (os remetentes cujas
mensagens foram entregues/lidas), **nunca** para o próprio autor da ação.

```jsonc
// Participante `userId` recebeu tudo até `at`
{ "type": "delivered", "conversationId": "conv-uuid", "userId": "user-uuid", "at": "2026-06-05T12:31:10.000Z" }

// Participante `userId` leu tudo até `at`
{ "type": "read", "conversationId": "conv-uuid", "userId": "user-uuid", "at": "2026-06-05T12:32:00.000Z" }
```

- `at`: ISO 8601 do watermark (tipicamente `now()` no processamento do ack).
- O app já ignora frames de tipo desconhecido, então pode lançar isso de forma
  incremental sem quebrar clientes antigos.
- O app aplica o watermark de forma monotônica (descarta `at` mais antigo que o
  já conhecido), então reentrega/ordem fora não causa regressão visual.

---

## Fluxo ponta a ponta (exemplo DM, A → B)

1. **A** envia → `POST /conversations/:id/messages` → `201`. App de A mostra ✓ (enviado).
2. Servidor entrega `message` para o socket de **B**.
   - Server-side (seção 3) **ou** app de B (seção 2) → `lastDeliveredAt(B) = now()`.
   - Servidor emite `{type:'delivered', userId: B, at}` para **A** → app de A vira ✓✓.
3. **B** abre a conversa → app de B → `POST /conversations/:id/read`.
   - `lastReadAt(B) = now()`; servidor emite `{type:'read', userId: B, at}` para **A**.
   - App de A vira ✓✓ **azul** (lido).

## Resumo do que o app já faz (não precisa backend)

- Dispara `POST /conversations/:id/read` ao abrir a conversa (já existia).
- Dispara `POST /conversations/:id/delivered` ao receber msg de outro com a
  conversa fechada.
- Trata os frames `delivered`/`read` e avança os watermarks no cache em tempo real.
- Deriva o check de cada mensagem dos watermarks de `participants`.
