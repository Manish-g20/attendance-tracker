const API = " ";

// Overall attendance
fetch(`${API}/attendance`)
    .then(res => res.json())
    .then(data => {
        const total = data.length;
        const present = data.filter(r => r.status === "P").length;
        const percent = total ? ((present / total) * 100).toFixed(2) : 0;

        overall.innerHTML = `
            <strong>Overall Attendance:</strong><br>
            Total Classes: ${total}<br>
            Present: ${present}<br>
            Attendance %: ${percent}%
        `;
    });

// Subject-wise stats
fetch(`${API}/stats`)
    .then(res => res.json())
    .then(data => {
        subjectStats.innerHTML = "";
        data.forEach(s => {
            const percent = s.total ? ((s.present / s.total) * 100).toFixed(2) : 0;
            subjectStats.innerHTML += `
                <tr>
                    <td>${s.subject}</td>
                    <td>${s.total}</td>
                    <td>${s.present}</td>
                    <td>${percent}%</td>
                </tr>
            `;
        });
    });
