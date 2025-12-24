# 🤖 AI Development Workflow Rules

## 📜 MANDATORY RULES - Tôi CAM KẾT tuân thủ

### ⛔ RULE 1: CHECKPOINT SYSTEM (Quan trọng nhất)

**Tôi PHẢI:**

- ✅ STOP tại mỗi checkpoint
- ✅ CHỜ user review và approve
- ✅ KHÔNG được tự ý tiếp tục khi chưa có approve
- ✅ KHÔNG được skip bất kỳ checkpoint nào

**Tôi KHÔNG ĐƯỢC:**

- ❌ Làm nhiều components cùng lúc
- ❌ Build trước rồi hỏi sau
- ❌ Giả định user sẽ approve
- ❌ Rush qua các bước

**Checkpoint Format:**

```
🛑 CHECKPOINT [số]: [Tên component]

📸 Preview: [link hoặc mô tả vị trí screenshot]

📋 Review Checklist:
- [ ] Colors: [Blue #1E40AF, Orange #F97316]
- [ ] Proportions: [dimensions]
- [ ] Materials: [metal look, industrial]
- [ ] Performance: [60fps]

⏸️ WAITING FOR YOUR APPROVAL...

Please respond:
✅ "Approved" or "OK" or "Continue"
🔄 "Change: [specific feedback]"
💬 "Question: [your question]"
```

---

### 🎨 RULE 2: DESIGN FIDELITY

**Màu sắc - STRICT:**

- Blue columns: `#1E40AF` đến `#2563EB`
- Orange beams: `#EA580C` đến `#F97316`
- KHÔNG dùng màu khác
- KHÔNG "creative interpretation"

**Reference photos:**

- Luôn check lại 3 hình ảnh trong DESIGN_REFERENCES.md
- Khi doubt → hỏi user trước khi quyết định
- Màu phải match ±5% tolerance

---

### 🔍 RULE 3: INCREMENTAL DEVELOPMENT

**Build order PHẢI theo:**

1. Single component (smallest unit)
2. Small group (few components)
3. Medium assembly
4. Full system

**Ví dụ Rack:**

```
1️⃣ Single Cell → Review ✋
2️⃣ Row (5 cells) → Review ✋
3️⃣ Level (4 rows) → Review ✋
4️⃣ Block (full grid) → Review ✋
```

**KHÔNG được:**

- Jump directly to full block
- Build multiple systems parallel
- Integrate before approval

---

### 📸 RULE 4: DOCUMENTATION OF EACH CHECKPOINT

**Mỗi checkpoint, tôi PHẢI cung cấp:**

1. **Screenshot(s):**
   - Multiple angles (front, side, top, isometric)
   - Clear resolution
   - Good lighting
   - Show scale reference

2. **Video (if needed):**
   - 360° rotation
   - Zoom in/out demo
   - 10-30 seconds
   - Smooth playback

3. **Checklist:**
   - Every point checked ✓ or noted ✗
   - Honest assessment
   - Known issues disclosed

4. **Performance metrics:**
   - FPS count
   - Load time
   - Memory usage (if relevant)

---

### 🛠️ RULE 5: REVISION PROTOCOL

**Khi user request changes:**

```
User: "🔄 Change: Orange too bright"

Tôi PHẢI:
1. Acknowledge: "Understood - making orange darker"
2. Make ONLY requested change
3. Re-submit SAME checkpoint
4. Wait for re-approval
5. NOT move to next step

Tôi KHÔNG ĐƯỢC:
- Make additional changes not requested
- Assume other things need fixing
- Skip re-review
```

---

### 💬 RULE 6: COMMUNICATION CLARITY

**Khi present checkpoint:**

- Ngắn gọn, rõ ràng
- Bullet points
- Visual first (hình ảnh trước text)
- Explicit về việc đang CHỜ approval

**Tránh:**

- Long explanations
- Technical jargon không cần thiết
- Múa đẹp (just show the work)

---

### ⚡ RULE 7: PERFORMANCE MONITORING

**Mỗi component PHẢI:**

- Test performance riêng biệt
- Report FPS
- Check memory
- Optimize nếu < 60fps

**Thresholds:**

- Single component: 60fps required
- Small assembly: 60fps required
- Full scene: 45fps minimum acceptable
- Any lag → optimize before continuing

---

### 🚫 RULE 8: WHAT I CANNOT DO WITHOUT APPROVAL

**NEVER do these without explicit user approval:**

1. ❌ Change color scheme
2. ❌ Alter dimensions significantly (>10%)
3. ❌ Skip a checkpoint
4. ❌ Add "creative" features
5. ❌ Use different materials than specified
6. ❌ Change the roadmap order
7. ❌ Install unplanned dependencies
8. ❌ Make assumptions about user preferences

**Always ask first for:**

- Design decisions
- Technical approach changes
- Timeline adjustments
- New features

---

### ✅ RULE 9: APPROVAL CONFIRMATION

**Valid approvals:**

- ✅ "Approved"
- ✅ "OK"
- ✅ "Looks good"
- ✅ "Continue"
- ✅ "Next step"
- ✅ Any clear affirmative

**NOT valid approvals:**

- ❓ Silence (no response)
- ❓ Questions without approval
- ❓ Partial feedback without clear approve
- ❓ "Maybe" or "Probably OK"

**When unclear:** Ask explicitly: "Is this approved to continue?"

---

### 🎯 RULE 10: FOCUS & SCOPE

**Current checkpoint only:**

- Don't explain future steps
- Don't work ahead
- Don't prepare next component
- Focus 100% on current task

**Example:**

```
✅ Good:
"Here's the single rack cell.
Colors: Blue #2563EB, Orange #F97316
Waiting for approval."

❌ Bad:
"Here's the single rack cell. Next I'll make
a row, then a level, then integrate the
shuttle system with pathfinding..."
```

---

## 🔒 ENFORCEMENT

**I will:**

- Re-read these rules before each checkpoint
- Reference specific rule numbers when relevant
- Self-correct if I violate a rule
- Accept user calling out any violations

**User can:**

- Point to specific rule: "Rule 1 - you didn't wait"
- Stop me anytime: "🛑 Wait, you're going too fast"
- Request rule clarification
- Add new rules as needed

---

## 📝 RULE UPDATES

This file can be updated by user anytime.
Version tracking:

- v1.0 - Initial rules (Dec 23, 2025)
- Future versions will be logged here

---

## ✋ CHECKPOINT 0: RULE ACKNOWLEDGMENT

**Before starting any development:**

🛑 **I confirm:**

- [ ] I have read all 10 rules
- [ ] I understand the checkpoint system
- [ ] I will not skip reviews
- [ ] I will match design references
- [ ] I will stop and wait at each checkpoint
- [ ] I will follow incremental approach
- [ ] I will not make assumptions

**User must approve THIS before I start building:**

👤 **User approval needed:**

```
Type: "✅ Rules acknowledged - Start Checkpoint 1"
```

⏸️ **Waiting for your approval of these rules...**
