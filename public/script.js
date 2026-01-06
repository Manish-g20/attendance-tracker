const API = " ";

function mark() {
    const date = document.getElementById("date").value;
    const day = document.getElementById("day").value;
    const period = document.getElementById("period").value;
    const status = document.getElementById("status").value;

    if (!date || !day || !period || !status) {
        alert("Please fill all fields");
        return;
    }

    fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, day, period, status })
    })
    .then(res => {
        if (!res.ok) throw new Error("Bad Request");
        return res.json();
    })
    .then(() => loadAll())
    .catch(err => alert("Error marking attendance"));
}

function loadAll() {
    fetch(`${API}/attendance`)
        .then(res => res.json())
        .then(data => {
            const records = document.getElementById("records");
            records.innerHTML = "";
            data.forEach(r => {
                records.innerHTML += `
                <tr>
                    <td>${r.date}</td>
                    <td>${r.day}</td>
                    <td>${r.period}</td>
                    <td>${r.subject}</td>
                    <td class="${r.status === 'P' ? 'present' : 'absent'}">
                        ${r.status}
                    </td>
                    <td>
                        <button class="delete-btn"
                            onclick="clearAttendance('${r.date}','${r.day}','${r.period}')">
                            ❌ Clear
                        </button>
                    </td>
                </tr>`;
            });
        });

    fetch(`${API}/attendance/percentage`)
        .then(res => res.json())
        .then(d => {
            document.getElementById("percent").innerText = d.percent + "%";
        });
}

function clearAttendance(date, day, period) {
    if (!confirm("Clear this lecture?")) return;

    fetch(`${API}/attendance`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, day, period })
    })
    .then(() => loadAll());
}

loadAll();
