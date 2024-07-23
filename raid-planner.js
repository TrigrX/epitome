document.addEventListener('DOMContentLoaded', () => {
    const groupsTableBody = document.querySelector('#player-groups tbody');

    fetch('https://raid-helper.dev/api/raidplan/1262710377846935644')
        .then(response => response.json())
        .then(data => {
            processRaidData(data);
        })
        .catch(error => console.error('Error loading raid data:', error));

    function processRaidData(data) {
        const confirmedPlayers = data.filter(player => player.isConfirmed === 'confirmed');
        const groups = {};

        confirmedPlayers.forEach(player => {
            if (!groups[player.partyId]) {
                groups[player.partyId] = Array(5).fill(null); // Assuming 5 slots per group
            }
            groups[player.partyId][player.slotId - 1] = player;
        });

        Object.keys(groups).forEach(partyId => {
            const group = groups[partyId];
            group.forEach((player, index) => {
                const slotNumber = index + 1;
                const playerName = player ? player.name : 'Empty Slot';
                const groupRow = `<tr><td>Group ${partyId}</td><td>Slot ${slotNumber}</td><td>${playerName}</td></tr>`;
                groupsTableBody.innerHTML += groupRow;
            });
        });
    }
});
