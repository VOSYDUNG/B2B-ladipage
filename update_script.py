import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Goal 3: Remove Survey logic
js = re.sub(r'const surveyProducts = \[.*?\];', '', js, flags=re.DOTALL)
js = re.sub(r'function renderSurveyChips\(\) \{.*?\}', '', js, flags=re.DOTALL)
# Remove call to renderSurveyChips
js = js.replace('renderSurveyChips();', '')
# In handleFormSubmit, remove interestedProducts logic
js = re.sub(r'const interestedProducts = Array\.from.*?\.map\(cb => cb\.value\);', '', js, flags=re.DOTALL)

# Goal 4: Update WhatsApp number in CONFIG
js = js.replace("whatsappNumber: '8562099806327'", "whatsappNumber: '8562095355355'")
js = js.replace("020 9980 6327", "020 9535 5355")

# Goal 4: Get businessType and dob in form submission, add to userProfile
js = re.sub(r'(const userProfile = {.*?)(};)', r'\1  dob: document.getElementById("dob").value,\n  businessType: document.querySelector("input[name=\\"businessType\\"]:checked") ? document.querySelector("input[name=\\"businessType\\"]:checked").value : "",\n\2', js, flags=re.DOTALL)

# Goal 6: For step 3, since we removed the showcase grid, clicking "Quay Ngay" will spin. Wait, "Quay Ngay" button is still there. Let's make "Bước 3" directly trigger spinWheel if the user wanted "cho họ quay luôn thay vì đưa cơ cấu cho xem".
# The flow state 'wheel' previously showed the wheel-showcase-card. Since the grid is removed, the card just has a header and "Quay Ngay". It's already fine.
# But if they meant auto-spin, I could call `spinWheel()` inside `setFlowState('wheel')`.
# Actually, the user says "Bước 3 cho họ quay luôn thay vì đưa cơ cấu cho xem". The showcase is removed. Having a "Quay Ngay" button is safe, or I can just call spinWheel. Let's leave the button, it is a clear CTA.

# Goal 7: Remove condVi/condLo rendering from reward modal.
js = js.replace("const condition = currentLang === 'vi' ? details.condVi : details.condLo;", "const condition = '';")
js = js.replace("document.getElementById('result-condition').innerHTML = `<br><em>Điều kiện: ${condition}</em>`;", "document.getElementById('result-condition').innerHTML = '';")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
