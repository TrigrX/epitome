document.addEventListener("DOMContentLoaded", function() {
    const nameInput = document.getElementById('name-input');
    const classInput = document.getElementById('class-input');
    const specializationInput = document.getElementById('specialization-input');
    const addButton = document.getElementById('add-button');
    const playerList = document.getElementById('players');
    const tankTableBody = document.querySelector('#roster-tank tbody');
    const healerTableBody = document.querySelector('#roster-healer tbody');
    const rangeDpsTableBody = document.querySelector('#roster-range-dps tbody');
    const meleeDpsTableBody = document.querySelector('#roster-melee-dps tbody');
    const groupsTableBody = document.querySelector('#player-groups tbody');

    const lastCooldown45 = document.getElementById('last-cooldown-45');
    const lastCooldown40 = document.getElementById('last-cooldown-40');
    const lastCooldown35 = document.getElementById('last-cooldown-35');
    const lastCooldown30 = document.getElementById('last-cooldown-30');

    const specializations = {
        'Warrior': ['Arms', 'Fury', 'Protection'],
        'Paladin': ['Holy', 'Protection', 'Retribution'],
        'Hunter': ['Beast Mastery', 'Marksmanship', 'Survival'],
        'Rogue': ['Assassination', 'Combat', 'Subtlety'],
        'Priest': ['Discipline', 'Holy', 'Shadow'],
        'Death Knight': ['Blood_Tank', 'Frost_Tank', 'Unholy_Tank','Blood_DPS', 'Frost_DPS', 'Unholy_DPS'],
        'Shaman': ['Elemental', 'Enhancement', 'Restoration'],
        'Mage': ['Arcane', 'Fire', 'Frost'],
        'Warlock': ['Affliction', 'Demonology', 'Destruction'],
        'Druid': ['Balance', 'Feral', 'Guardian', 'Restoration']
    };

    const roles = {
        'Warrior': { 'Arms': 'Melee DPS', 'Fury': 'Melee DPS', 'Protection': 'Tank' },
        'Paladin': { 'Holy': 'Healer', 'Protection': 'Tank', 'Retribution': 'Melee DPS' },
        'Hunter': { 'Beast Mastery': 'Range DPS', 'Marksmanship': 'Range DPS', 'Survival': 'Range DPS' },
        'Rogue': { 'Assassination': 'Melee DPS', 'Combat': 'Melee DPS', 'Subtlety': 'Melee DPS' },
        'Priest': { 'Discipline': 'Healer', 'Holy': 'Healer', 'Shadow': 'Range DPS' },
        'Death Knight': { 'Blood_Tank': 'Tank', 'Frost_Tank': 'Tank', 'Unholy_Tank': 'Tank', 'Blood_DPS': 'Melee DPS', 'Frost_DPS': 'Melee DPS', 'Unholy_DPS': 'Melee DPS' },
        'Shaman': { 'Elemental': 'Range DPS', 'Enhancement': 'Melee DPS', 'Restoration': 'Healer' },
        'Mage': { 'Arcane': 'Range DPS', 'Fire': 'Range DPS', 'Frost': 'Range DPS' },
        'Warlock': { 'Affliction': 'Range DPS', 'Demonology': 'Range DPS', 'Destruction': 'Range DPS' },
        'Druid': { 'Balance': 'Range DPS', 'Feral': 'Melee DPS', 'Guardian': 'Tank', 'Restoration': 'Healer' }
    };

    classInput.addEventListener('change', function() {
        const selectedClass = classInput.value;
        specializationInput.innerHTML = '<option value="">Select Specialization</option>';
        if (specializations[selectedClass]) {
            specializations[selectedClass].forEach(spec => {
                const option = document.createElement('option');
                option.value = spec;
                option.textContent = spec;
                specializationInput.appendChild(option);
            });
        }
    });

    addButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const playerClass = classInput.value;
        const specialization = specializationInput.value;

        if (name && playerClass && specialization) {
            const player = { name, playerClass, specialization, rostered: false };

            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const nameText = document.createElement('span');
            nameText.textContent = `${name} (${playerClass} - ${specialization})`;

            listItem.appendChild(checkbox);
            listItem.appendChild(nameText);
            playerList.appendChild(listItem);

            nameInput.value = '';
            classInput.value = '';
            specializationInput.innerHTML = '<option value="">Select Specialization</option>';

            // Add event listener to checkbox
            checkbox.addEventListener('change', function() {
                player.rostered = this.checked;
                if (this.checked) {
                    addToRoster(player);
                } else {
                    removeFromRoster(player.name);
                }
                savePlayersToStorage();
                updateAll(); // Ensure all tables are updated on roster change
            });

            savePlayerToStorage(player);
        }
    });

    function addToRoster(player) {
        const role = roles[player.playerClass][player.specialization];
        const row = document.createElement('tr');
        row.innerHTML = `<td>${player.name}</td><td>${player.playerClass}</td><td>${player.specialization}</td>`;
        switch (role) {
            case 'Tank':
                tankTableBody.appendChild(row);
                break;
            case 'Healer':
                healerTableBody.appendChild(row);
                break;
            case 'Range DPS':
                rangeDpsTableBody.appendChild(row);
                break;
            case 'Melee DPS':
                meleeDpsTableBody.appendChild(row);
                break;
        }
    }

    function removeFromRoster(name) {
        [tankTableBody, healerTableBody, rangeDpsTableBody, meleeDpsTableBody].forEach(tableBody => {
            const rows = tableBody.getElementsByTagName('tr');
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].cells[0].textContent === name) {
                    tableBody.removeChild(rows[i]);
                    break;
                }
            }
        });
    }

    function savePlayerToStorage(player) {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const index = players.findIndex(p => p.name === player.name);
    if (index !== -1) {
        players[index] = player; // Update existing player
    } else {
        players.push(player); // Add new player
    }
    localStorage.setItem('players', JSON.stringify(players));
    updateAll(); // Update all tables after saving
}


    function savePlayersToStorage() {
    const players = [];
    playerList.childNodes.forEach(listItem => {
        const checkbox = listItem.querySelector('input[type="checkbox"]');
        const nameText = listItem.querySelector('span').textContent;
        const [name, classSpec] = nameText.split(' (');
        const [playerClass, specialization] = classSpec.slice(0, -1).split(' - ');
        players.push({
            name: name.trim(),
            playerClass: playerClass.trim(),
            specialization: specialization.trim(),
            rostered: checkbox.checked // Save the rostered status
        });
    });
    localStorage.setItem('players', JSON.stringify(players));
}


function loadPlayersFromStorage() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    players.forEach(player => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = player.rostered;
        const nameText = document.createElement('span');
        nameText.textContent = `${player.name} (${player.playerClass} - ${player.specialization})`;

        listItem.appendChild(checkbox);
        listItem.appendChild(nameText);
        playerList.appendChild(listItem);

        if (player.rostered) {
            addToRoster(player);
        }

        checkbox.addEventListener('change', function() {
            player.rostered = this.checked;
            if (this.checked) {
                addToRoster(player);
            } else {
                removeFromRoster(player.name);
            }
            savePlayersToStorage();
            updateAll(); // Ensure all tables are updated on roster change
        });
    });
    updateAll(); // Ensure all tables are updated on page load
}


function updateSleetStorm() {
	const players = JSON.parse(localStorage.getItem('players')) || [];
	const paladins = players.filter(player => player.playerClass === 'Paladin' && player.rostered);
	const druids = players.filter(player => player.playerClass === 'Druid' && player.rostered);
	const warriors = players.filter(player => player.playerClass === 'Warrior' && player.rostered);

	const sleetstorm1 = document.getElementById('sleetstorm-1');
	const sleetstorm2 = document.getElementById('sleetstorm-2');
	const sleetstorm3 = document.getElementById('sleetstorm-3');
	const sleetstorm4 = document.getElementById('sleetstorm-4');

	sleetstorm1.textContent = paladins[0] ? `${paladins[0].name} | AM` : '';
	sleetstorm2.textContent = (druids[0] ? `${druids[0].name} | Tranq` : '') + (druids[0] && warriors[0] ? ' + ' : '') + (warriors[0] ? `${warriors[0].name} | Rally` : '');
	sleetstorm3.textContent = paladins[1] ? `${paladins[1].name} | AM` : '';
	sleetstorm4.textContent = (druids[1] ? `${druids[1].name} | Tranq` : '') + (druids[1] && warriors[1] ? ' + ' : '') + (warriors[1] ? `${warriors[1].name} | Rally` : '');
}

// Sleet Storm
function copySleetStormMRTData() {
	const sleetstorm1 = document.getElementById('sleetstorm-1').textContent;
	const sleetstorm2 = document.getElementById('sleetstorm-2').textContent;
	const sleetstorm3 = document.getElementById('sleetstorm-3').textContent;
	const sleetstorm4 = document.getElementById('sleetstorm-4').textContent;

	const spellIDs = {
		'AM': 31821,
		'Tranq': 740,
		'Rally': 97462
	};

	function addSpellID(text) {
		return text.replace(/(\w+) \| (\w+)/g, (match, player, cd) => `${player} | {spell:${spellIDs[cd]}}`);
	}

	const sleetstormMRTData = 
`{{time:00:00,SCC:84644:1}}|cffffff00Sleet#01|r - no delay - ${addSpellID(sleetstorm1)}
{{time:00:08,SCC:84644:1}}|cffffff00Sleet#01|r - 8s delay - ${addSpellID(sleetstorm2)}
{{time:00:00,SCC:84644:2}}|cffffff00Sleet#02|r - no delay - ${addSpellID(sleetstorm3)}
{{time:00:08,SCC:84644:2}}|cffffff00Sleet#02|r - 8s delay - ${addSpellID(sleetstorm4)}`;

	navigator.clipboard.writeText(sleetstormMRTData).then(() => {
		alert('Sleet Storm MRT data copied to clipboard');
	}, (err) => {
		console.error('Could not copy MRT data: ', err);
	});
}

document.getElementById('copy-sleetstorm-data').addEventListener('click', copySleetStormMRTData);














function updateAlAkirAcid() {
	const players = JSON.parse(localStorage.getItem('players')) || [];
	const cooldowns = [
		...players.filter(player => player.playerClass === 'Warrior' && player.rostered).map(player => `${player.name} | Rally`),
		...players.filter(player => player.playerClass === 'Shaman' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | SLT`),
		...players.filter(player => player.playerClass === 'Druid' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | Tranq`),
		...players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Barrier`),
		...players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Hymn`)
	];

	// Ensure cooldowns are unique
	const uniqueCooldowns = [...new Set(cooldowns)];

	// Function to select cooldowns
	function selectCooldowns(count) {
		const selected = [];
		let warriorIncluded = false;

		for (let i = 0; i < uniqueCooldowns.length && selected.length < count; i++) {
			const cooldown = uniqueCooldowns[i];
			if (cooldown.includes('Rally')) {
				if (!warriorIncluded) {
					selected.push(cooldown);
					warriorIncluded = true;
				}
			} else {
				selected.push(cooldown);
			}
		}

		// Remove selected cooldowns from the list
		selected.forEach(cooldown => {
			const index = uniqueCooldowns.indexOf(cooldown);
			if (index !== -1) {
				uniqueCooldowns.splice(index, 1);
			}
		});

		return selected.join(', ');
	}

	// Populate the acid phase cooldowns table
	document.getElementById('acid-cooldown-35').textContent = selectCooldowns(2);
	document.getElementById('acid-cooldown-30').textContent = selectCooldowns(2);
	document.getElementById('acid-cooldown-45').textContent = selectCooldowns(1);
	document.getElementById('acid-cooldown-40').textContent = selectCooldowns(1);
}

function updateAlakirGroups() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const rosteredPlayers = players.filter(player => player.rostered); // Only include rostered players
    const tanks = rosteredPlayers.filter(player => roles[player.playerClass][player.specialization] === 'Tank');
    const healers = rosteredPlayers.filter(player => roles[player.playerClass][player.specialization] === 'Healer');
    const meleeDps = rosteredPlayers.filter(player => roles[player.playerClass][player.specialization] === 'Melee DPS');
    const rangeDps = rosteredPlayers.filter(player => roles[player.playerClass][player.specialization] === 'Range DPS');

    const groupsTableBody = document.getElementById('player-groups').getElementsByTagName('tbody')[0];
    groupsTableBody.innerHTML = ''; // Clear previous groups

    const totalGroups = 8;
    const groups = Array.from({ length: totalGroups }, () => []);

    // Add tanks to the first group
    tanks.forEach(tank => {
        if (groups[0].length < 4) {
            groups[0].push(tank);
        }
    });

    // Add healers to each group
    healers.forEach((healer, index) => {
        const groupIndex = index % totalGroups;
        if (groups[groupIndex].length < (groupIndex === 0 ? 4 : 3)) {
            groups[groupIndex].push(healer);
        }
    });

    // Prioritize melee DPS for groups 3 to 7
    meleeDps.forEach((dpsPlayer, index) => {
        let added = false;
        for (let i = 2; i < totalGroups && !added; i++) { // Groups 3 to 7 are indices 2 to 6
            const groupIndex = i;
            if (groups[groupIndex].length < 3) {
                groups[groupIndex].push(dpsPlayer);
                added = true;
            }
        }
    });

    // Distribute remaining melee DPS to other groups
    meleeDps.forEach((dpsPlayer, index) => {
        if (!groups.some(group => group.includes(dpsPlayer))) {
            for (let i = 0; i < totalGroups; i++) {
                if (groups[i].length < (i === 0 ? 4 : 3)) {
                    groups[i].push(dpsPlayer);
                    break;
                }
            }
        }
    });

    // Distribute ranged DPS to each group
    rangeDps.forEach((dpsPlayer, index) => {
        let added = false;
        for (let i = 0; i < totalGroups && !added; i++) {
            const groupIndex = (index + i) % totalGroups;
            if (groups[groupIndex].length < (groupIndex === 0 ? 4 : 3)) {
                groups[groupIndex].push(dpsPlayer);
                added = true;
            }
        }
    });

    // Distribute remaining players
    const remainingPlayers = rosteredPlayers.filter(player => !groups.some(group => group.includes(player)));
    remainingPlayers.forEach((player, index) => {
        let added = false;
        for (let i = 0; i < totalGroups && !added; i++) {
            const groupIndex = (index + i) % totalGroups;
            if (groups[groupIndex].length < (groupIndex === 0 ? 4 : 3)) {
                groups[groupIndex].push(player);
                added = true;
            }
        }
    });

    // Add groups to the table
    groups.forEach((group, index) => {
        const row = document.createElement('tr');
        const groupPlayers = group.map(player => `${player.name}`).join(', ');
        row.innerHTML = `<td>Group ${index + 1}</td><td>${groupPlayers}</td>`;
        groupsTableBody.appendChild(row);
    });
}

function copyAlakirData() {
    const spellIDs = {
        'Rally': 97462,
        'SLT': 98008,
        'Tranq': 740,
        'Barrier': 62618,
        'Hymn': 64843
    };

    function getCooldownText(id) {
        const textContent = document.getElementById(id).textContent;
        return textContent.split(', ').map(cd => {
            const [player, cooldown] = cd.split(' | ');
            return `${player} {spell:${spellIDs[cooldown]}}`;
        }).join(' + ');
    }

    const acid45 = getCooldownText('acid-cooldown-45');
    const acid40 = getCooldownText('acid-cooldown-40');
    const acid35 = getCooldownText('acid-cooldown-35');
    const acid30 = getCooldownText('acid-cooldown-30');

    const groups = [];
    for (let i = 1; i <= 8; i++) {
        const groupRow = document.querySelector(`#player-groups tr:nth-child(${i}) td:nth-child(2)`);
        groups.push(groupRow ? groupRow.textContent : '');
    }

    const alakirMRTData = `
|cff00ffffAl'Alakir|r
|cff00ff00STAGGERED Acid rain CD's|r
{{time:00:00,e,HPS_alakir_45}}|cffffff00at 45%|r - ${acid45}
{{time:00:00,e,HPS_alakir_40}}|cffffff00at 40%|r - ${acid40}
{{time:00:05,e,HPS_alakir_35}}|cffffff00at 35%|r - ${acid35}
{{time:00:05,e,HPS_alakir_30}}|cffffff00at 30%|r - ${acid30}

|cff00ff00Groups|r
|cffffff00Group#01|r{square} - ${groups[0]}
|cffffff00Group#02|r - ${groups[1]}
|cffffff00Group#03|r{triangle} - ${groups[2]}
|cffffff00Group#04|r - ${groups[3]}
|cffffff00Group#05|r{diamond} - ${groups[4]}
|cffffff00Group#06|r - ${groups[5]}
|cffffff00Group#07|r{cross} - ${groups[6]}
|cffffff00Group#08|r - ${groups[7]}
`;

    navigator.clipboard.writeText(alakirMRTData.trim()).then(() => {
        alert('Alakir MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

document.getElementById('copy-alakir-data').addEventListener('click', copyAlakirData);











// Halfus Breath
function updateHalfusBreath() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const paladins = players.filter(player => 
        player.playerClass === 'Paladin' && 
        player.rostered && 
        (player.specialization === 'Holy' || player.specialization === 'Protection')
    );

    // Define the priority order for breaths
    const breathOrder = [1, 6, 2, 7, 3, 8, 4, 9, 5, 10];

    breathOrder.forEach((breath, index) => {
        const paladinIndex = Math.floor(index / 2); // Correctly cycle through the first 5 paladins
        const breathCell = document.getElementById(`breath-${breath}`);
        if (breathCell) {
            breathCell.textContent = paladins[paladinIndex] ? `${paladins[paladinIndex].name} | AM` : '';
            console.log(`Breath ${breath}:`, breathCell.textContent);
        } else {
            console.error(`Element with id breath-${breath} not found`);
        }
    });
}

// Halfus Roar
function updateHalfusRoar() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const cooldowns = [
        ...players.filter(player => player.playerClass === 'Warrior' && player.rostered).map(player => `${player.name} | Rally`),
        ...players.filter(player => player.playerClass === 'Shaman' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | SLT`),
        ...players.filter(player => player.playerClass === 'Druid' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | Tranq`),
        ...players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Barrier`),
        ...players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Hymn`)
    ];

    // Ensure cooldowns are unique
    const uniqueCooldowns = [...new Set(cooldowns)];

    // Function to select cooldowns for each roar without placing Warriors together
    function selectCooldowns(count) {
        const selected = [];
        let warriorIncluded = false;

        for (let i = 0; i < uniqueCooldowns.length && selected.length < count; i++) {
            const cooldown = uniqueCooldowns[i];
            if (cooldown.includes('Rally')) {
                if (!warriorIncluded) {
                    selected.push(cooldown);
                    warriorIncluded = true;
                }
            } else {
                selected.push(cooldown);
            }
        }

        // Remove selected cooldowns from the list
        selected.forEach(cooldown => {
            const index = uniqueCooldowns.indexOf(cooldown);
            if (index !== -1) {
                uniqueCooldowns.splice(index, 1);
            }
        });

        return selected.join(' + ');
    }

    // Populate the Halfus Roar table
    for (let i = 1; i <= 3; i++) {
        const roarCell = document.getElementById(`roar-${i}`);
        if (roarCell) {
            const cooldownCount = Math.min(3, uniqueCooldowns.length);
            roarCell.textContent = selectCooldowns(cooldownCount);
            console.log(`Roar ${i}:`, roarCell.textContent);
        } else {
            console.error(`Element with id roar-${i} not found`);
        }
    }
}

function copyHalfusData() {
    const spellIDs = {
        'AM': 31821,
        'Rally': 97462,
        'SLT': 98008,
        'Tranq': 740,
        'Barrier': 62618,
        'Hymn': 64843
    };

    function getCooldownText(id, count) {
        const textContent = document.getElementById(id).textContent;
        if (textContent) {
            return textContent.split(' + ').map(cd => {
                const [player, cooldown] = cd.split(' | ');
                if (cooldown && spellIDs[cooldown]) {
                    return `${player} {spell:${spellIDs[cooldown]}}`;
                }
                return null;
            }).filter(cd => cd !== null).slice(0, count).join(' + ');
        }
        return '';
    }

    let breathData = '';
    for (let i = 1; i <= 10; i++) {
        const breathText = getCooldownText(`breath-${i}`, 1) || '';
        breathData += `{{time:00:00,SCC:83707:${i}}}|cffffff00Breath#${i}|r - ${breathText}\n`;
    }

    let roarData = '';
    for (let i = 1; i <= 3; i++) {
        const roarText = getCooldownText(`roar-${i}`, 3) || '';
        roarData += `{{time:00:00,SCC:83710:${i * 3 - 2}}}|cffffff00Roar#${i}|r - ${roarText}\n`;
    }

    const halfusMRTData = `
|cff00ff00Halfus Breath|r
${breathData.trim()}

|cff00ff00Halfus Roar|r
${roarData.trim()}
`;

    navigator.clipboard.writeText(halfusMRTData.trim()).then(() => {
        alert('Halfus MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

document.getElementById('copy-halfus-data').addEventListener('click', copyHalfusData);











function updateVTBlackouts() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const cooldowns = [
        ...players.filter(player => player.playerClass === 'Warrior' && player.rostered).map(player => `${player.name} | Rally`),
        ...players.filter(player => player.playerClass === 'Shaman' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | SLT`),
        ...players.filter(player => player.playerClass === 'Druid' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | Tranq`),
        ...players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Barrier`),
        ...players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Hymn`)
    ];

    // Ensure cooldowns are unique
    const uniqueCooldowns = [...new Set(cooldowns)];

    // Function to select cooldowns for each blackout without placing Warriors together
    function selectCooldowns(minCount, maxCount) {
        const selected = [];
        let warriorIncluded = false;

        for (let i = 0; i < uniqueCooldowns.length && selected.length < maxCount; i++) {
            const cooldown = uniqueCooldowns[i];
            if (cooldown.includes('Rally')) {
                if (!warriorIncluded) {
                    selected.push(cooldown);
                    warriorIncluded = true;
                }
            } else {
                selected.push(cooldown);
            }
        }

        // Ensure at least minCount cooldowns are selected
        while (selected.length < minCount) {
            selected.push(uniqueCooldowns.shift());
        }

        // Remove selected cooldowns from the list
        selected.forEach(cooldown => {
            const index = uniqueCooldowns.indexOf(cooldown);
            if (index !== -1) {
                uniqueCooldowns.splice(index, 1);
            }
        });

        return selected.join(', ');
    }

    // Populate the V&T Blackouts table
    const blackoutConfig = [
        { id: 'blackout-1', min: 1, max: 2 },
        { id: 'blackout-2', min: 1, max: 2 },
        { id: 'blackout-3', min: 1, max: 4 }
    ];

    blackoutConfig.forEach(config => {
        const blackoutCell = document.getElementById(config.id);
        if (blackoutCell) {
            blackoutCell.textContent = selectCooldowns(config.min, config.max);
            console.log(`${config.id}:`, blackoutCell.textContent);
        } else {
            console.error(`Element with id ${config.id} not found`);
        }
    });
}

function updateVTShadowRealmGroups() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    
    const tanks = players.filter(player => 
        player.rostered && roles[player.playerClass][player.specialization] === 'Tank'
    );

    const healers = players.filter(player => 
        player.rostered && roles[player.playerClass][player.specialization] === 'Healer'
    );

    const restoDruids = healers.filter(player => player.playerClass === 'Druid' && player.specialization === 'Restoration');
    const otherHealers = healers.filter(player => !(player.playerClass === 'Druid' && player.specialization === 'Restoration'));

    const hunters = players.filter(player => 
        player.rostered && player.playerClass === 'Hunter'
    );

    const rangeDps = players.filter(player => 
        player.rostered && roles[player.playerClass][player.specialization] === 'Range DPS' && player.playerClass !== 'Hunter'
    );

    const meleeDps = players.filter(player => 
        player.rostered && roles[player.playerClass][player.specialization] === 'Melee DPS'
    );

    function selectGroupPlayers() {
        const selectedPlayers = [];

        // Add 1 tank
        if (tanks.length > 0) {
            selectedPlayers.push(tanks.shift());
        }

        // Add 1 healer, prioritizing Restoration Druid
        if (restoDruids.length > 0) {
            selectedPlayers.push(restoDruids.shift());
        } else if (otherHealers.length > 0) {
            selectedPlayers.push(otherHealers.shift());
        }

        // Add 1 hunter if available
        if (hunters.length > 0) {
            selectedPlayers.push(hunters.shift());
        }

        // Add remaining players prioritizing range DPS then melee DPS
        while (selectedPlayers.length < 5) {
            if (rangeDps.length > 0) {
                selectedPlayers.push(rangeDps.shift());
            } else if (meleeDps.length > 0) {
                selectedPlayers.push(meleeDps.shift());
            } else {
                break; // No more players available
            }
        }

        return selectedPlayers.map(player => player.name).join(', ');
    }

    // Populate the V&T Shadow Realm Groups table
    const group1 = selectGroupPlayers();
    const group2 = selectGroupPlayers();

    document.getElementById('shadow-group-1').textContent = group1;
    document.getElementById('shadow-group-2').textContent = group2;

    console.log(`Shadow Group 1: ${group1}`);
    console.log(`Shadow Group 2: ${group2}`);
}

function copyVTData() {
    const spellIDs = {
        'AM': 31821,
        'Rally': 97462,
        'SLT': 98008,
        'Tranq': 740,
        'Barrier': 62618,
        'Hymn': 64843
    };

    function getCooldownText(id, count) {
        const textContent = document.getElementById(id).textContent;
        if (textContent) {
            return textContent.split(', ').map(cd => {
                const [player, cooldown] = cd.split(' | ');
                if (cooldown && spellIDs[cooldown]) {
                    return `${player} {spell:${spellIDs[cooldown]}}`;
                }
                return null;
            }).filter(cd => cd !== null).slice(0, count).join(' + ');
        }
        return '';
    }

    let blackoutData = '';
    for (let i = 1; i <= 3; i++) {
        const blackoutText = getCooldownText(`blackout-${i}`, 4) || '';
        blackoutData += `{{time:00:03,SAA:86788:${i}}}|cffffff00Blackout#${i}|r - ${blackoutText}\n`;
    }

    const group1 = document.getElementById('shadow-group-1').textContent || '';
    const group2 = document.getElementById('shadow-group-2').textContent || '';

    const vtMRTData = `
|cff00ffffVT Shadow Realm Groups|r
{{time:00:05,SCC:86360:1} everyone - {spell:32182}}Heroism 5 seconds into the fight
|cff00ff00Group 1|r - ${group1}
|cff00ff00Group 2|r - ${group2}

|cff00ffffVT Blackout|r
${blackoutData.trim()}
`;

    navigator.clipboard.writeText(vtMRTData.trim()).then(() => {
        alert('VT MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

document.getElementById('copy-vt-data').addEventListener('click', copyVTData);

















function updateCouncilAegis() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = {
        shamanSLT: players.filter(player => player.playerClass === 'Shaman' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | SLT`),
        druidTranq: players.filter(player => player.playerClass === 'Druid' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | Tranq`),
        priestBarrier: players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Barrier`),
        priestHymn: players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Hymn`),
        paladinAM: players.filter(player => player.playerClass === 'Paladin' && player.specialization === 'Holy' && player.rostered).map(player => `${player.name} | AM`)
    };

    const usedPlayers = new Set();

    function selectCooldowns(priorityList, maxCount, allowPaladin = true) {
        const selected = [];
        const tempUsedPlayers = new Set();
        let paladinIncluded = false;

        for (const key in priorityList) {
            for (const cooldown of priorityList[key]) {
                const playerName = cooldown.split(' | ')[0];
                const isPaladin = cooldown.includes('Paladin');

                if (!usedPlayers.has(playerName) && !tempUsedPlayers.has(playerName) && selected.length < maxCount) {
                    if (isPaladin && (paladinIncluded || !allowPaladin)) continue;
                    selected.push(cooldown);
                    tempUsedPlayers.add(playerName);
                    if (isPaladin) paladinIncluded = true;
                }
                if (selected.length >= maxCount) break;
            }
            if (selected.length >= maxCount) break;
        }

        selected.forEach(cooldown => usedPlayers.add(cooldown.split(' | ')[0]));

        return selected.join(', ');
    }

    function selectCooldownsForRow(config) {
        const aegisCell = document.getElementById(config.id);
        if (aegisCell) {
            aegisCell.textContent = selectCooldowns(config.priorityList, 2, config.allowPaladin);
            console.log(`${config.id}:`, aegisCell.textContent);
        } else {
            console.error(`Element with id ${config.id} not found`);
        }
    }

    // Configure rows
    const aegisConfig = [
        {
            id: 'aegis-1',
            priorityList: {
                shamanSLT: cooldowns.shamanSLT,
                druidTranq: cooldowns.druidTranq,
                priestBarrier: cooldowns.priestBarrier,
                priestHymn: cooldowns.priestHymn
            },
            allowPaladin: false
        },
        {
            id: 'aegis-2',
            priorityList: {
                paladinAM: cooldowns.paladinAM,
                shamanSLT: cooldowns.shamanSLT,
                druidTranq: cooldowns.druidTranq,
                priestBarrier: cooldowns.priestBarrier,
                priestHymn: cooldowns.priestHymn
            },
            allowPaladin: true
        },
        {
            id: 'aegis-3',
            priorityList: {
                paladinAM: cooldowns.paladinAM,
                shamanSLT: cooldowns.shamanSLT,
                druidTranq: cooldowns.druidTranq,
                priestBarrier: cooldowns.priestBarrier,
                priestHymn: cooldowns.priestHymn
            },
            allowPaladin: true
        }
    ];

    // Ensure Paladins are distributed across rows
    const paladins = cooldowns.paladinAM;
    const row2Cooldowns = aegisConfig[1].priorityList;
    const row3Cooldowns = aegisConfig[2].priorityList;

    if (paladins.length > 1) {
        row2Cooldowns.paladinAM = [paladins[0]];
        row3Cooldowns.paladinAM = [paladins[1]];
    } else if (paladins.length === 1) {
        row2Cooldowns.paladinAM = paladins;
        delete row3Cooldowns.paladinAM;  // Remove Paladins from row 3 if only one is available
    } else {
        delete row2Cooldowns.paladinAM;  // No Paladins available
        delete row3Cooldowns.paladinAM;  // No Paladins available
    }

    // Populate the Council - Aegis of Flame table
    aegisConfig.forEach(config => selectCooldownsForRow(config));
}

function updateElectricInstability() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = {
        warriorRally: players.filter(player => player.playerClass === 'Warrior' && player.rostered).map(player => `${player.name} | Rally`),
        shamanSLT: players.filter(player => player.playerClass === 'Shaman' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | SLT`),
        druidTranq: players.filter(player => player.playerClass === 'Druid' && player.specialization === 'Restoration' && player.rostered).map(player => `${player.name} | Tranq`),
        priestBarrier: players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Barrier`),
        priestHymn: players.filter(player => player.playerClass === 'Priest' && player.specialization === 'Discipline' && player.rostered).map(player => `${player.name} | Hymn`)
    };

    const usedPlayers = new Set();

    function selectCooldowns(cooldowns, maxCount) {
        const selected = [];
        const tempUsedPlayers = new Set();

        for (const key in cooldowns) {
            for (const cooldown of cooldowns[key]) {
                const playerName = cooldown.split(' | ')[0];

                if (!usedPlayers.has(playerName) && !tempUsedPlayers.has(playerName) && selected.length < maxCount) {
                    selected.push(cooldown);
                    tempUsedPlayers.add(playerName);
                }
                if (selected.length >= maxCount) break;
            }
            if (selected.length >= maxCount) break;
        }

        selected.forEach(cooldown => usedPlayers.add(cooldown.split(' | ')[0]));

        return selected.join(', ');
    }

    // Populate the Council - Electric Instability table
    const instabilityConfig = [
        { id: 'electric-instability-1', maxCount: 1 },
        { id: 'electric-instability-2', maxCount: 1 },
        { id: 'electric-instability-3', maxCount: 1 },
        { id: 'electric-instability-4', maxCount: 1 },
        { id: 'electric-instability-5', maxCount: 1 },
        { id: 'electric-instability-6', maxCount: 1 }
    ];

    instabilityConfig.forEach(config => {
        const instabilityCell = document.getElementById(config.id);
        if (instabilityCell) {
            instabilityCell.textContent = selectCooldowns(cooldowns, config.maxCount);
            console.log(`${config.id}:`, instabilityCell.textContent);
        } else {
            console.error(`Element with id ${config.id} not found`);
        }
    });
}

function updateFinalPhasePositions() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const healers = players.filter(player => ['Shaman', 'Druid', 'Priest', 'Paladin'].includes(player.playerClass) && player.rostered && ['Restoration', 'Holy', 'Discipline'].includes(player.specialization));
    const ranged = players.filter(player => ['Hunter', 'Mage', 'Warlock', 'Priest'].includes(player.playerClass) && player.rostered && !['Tank', 'Melee'].includes(player.specialization));

    const groups = {
        group1: [],
        group2: [],
        group3: [],
        group4: [],
        group5: []
    };

    const groupKeys = Object.keys(groups);
    const maxPerGroup = Math.ceil((healers.length + ranged.length) / groupKeys.length);

    // Ensure each group gets at least one healer if possible
    for (let i = 0; i < healers.length; i++) {
        const groupKey = groupKeys[i % groupKeys.length];
        groups[groupKey].push(healers[i].name);
    }

    // Distribute ranged DPS evenly
    let rangedIndex = 0;
    while (rangedIndex < ranged.length) {
        const groupKey = groupKeys[rangedIndex % groupKeys.length];
        if (groups[groupKey].length < maxPerGroup) {
            groups[groupKey].push(ranged[rangedIndex].name);
        }
        rangedIndex++;
    }

    // Balance the groups if necessary
    let filledGroups = {};
    groupKeys.forEach(key => filledGroups[key] = groups[key].length);

    while (Math.max(...Object.values(filledGroups)) - Math.min(...Object.values(filledGroups)) > 1) {
        for (let i = 0; i < groupKeys.length; i++) {
            const currentKey = groupKeys[i];
            const nextKey = groupKeys[(i + 1) % groupKeys.length];

            if (filledGroups[currentKey] > filledGroups[nextKey]) {
                const player = groups[currentKey].pop();
                groups[nextKey].push(player);
                filledGroups[currentKey]--;
                filledGroups[nextKey]++;
            }
        }
    }

    // Populate the table row by row
    const maxRows = Math.max(...groupKeys.map(key => groups[key].length));
    const tableBody = document.getElementById('final-phase-positions-body');
    tableBody.innerHTML = ''; // Clear previous content

    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('tr');
        groupKeys.forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = groups[key][i] || ''; // Add player name or empty string if no player
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    }

    console.log('Final Phase Positions:', groups);
}

function copyCouncilData() {
    const spellIDs = {
        'AM': 31821,
        'Rally': 97462,
        'SLT': 98008,
        'Tranq': 740,
        'Barrier': 62618,
        'Hymn': 64843
    };

    function getCooldownText(id) {
        const textContent = document.getElementById(id).textContent;
        if (textContent) {
            return textContent.split(', ').map(cd => {
                const [player, cooldown] = cd.split(' | ');
                if (cooldown && spellIDs[cooldown]) {
                    return `${player} {spell:${spellIDs[cooldown]}}`;
                }
                return null;
            }).filter(cd => cd !== null).join(' + ');
        }
        return '';
    }

    let aegisData = '';
    for (let i = 1; i <= 3; i++) {
        const aegisText = getCooldownText(`aegis-${i}`) || '';
        aegisData += `|cffffff00Aegis#${i}|r {{time:00:03,SCC:82631:${i}}}${aegisText}\n`;
    }

    let instabilityData = '';
    for (let i = 1; i <= 6; i++) {
        const instabilityText = getCooldownText(`electric-instability-${i}`) || '';
        instabilityData += `|cffffff00Phase3#${i}|r {{time:00:02,SCC:84948:${i}}} - ${instabilityText}\n`;
    }

    const groups = {
        group1: [],
        group2: [],
        group3: [],
        group4: [],
        group5: []
    };

    const tableBody = document.getElementById('final-phase-positions-body');
    tableBody.querySelectorAll('tr').forEach((row, rowIndex) => {
        row.querySelectorAll('td').forEach((cell, cellIndex) => {
            const groupKey = `group${cellIndex + 1}`;
            groups[groupKey][rowIndex] = cell.textContent;
        });
    });

    const groupIcons = ['{square}', '{triangle}', '{diamond}', '{cross}', '{star}'];
    const groupText = Object.keys(groups).map((key, index) => {
        const groupNumber = index + 1;
        const icon = groupIcons[index];
        const players = groups[key].filter(player => player !== '').join(', ');
        return `|cffffff00Group#${groupNumber}${icon}|r - ${players}`;
    }).join('\n');

    const councilMRTData = `
|cff00ff00Council Last Phase Groups|r
${groupText}

|cff00ffffCouncil Aegis|r
${aegisData.trim()}

|cff00ffffCouncil Electric Instability|r
${instabilityData.trim()}
`;

    navigator.clipboard.writeText(councilMRTData.trim()).then(() => {
        alert('Council MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

function getIcon(groupNumber) {
    const icons = ['{square}', '{triangle}', '{diamond}', '{cross}', '{star}'];
    return icons[(groupNumber - 1) % icons.length];
}

document.getElementById('copy-council-data').addEventListener('click', copyCouncilData);

















function updateEmpoweredShadows() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Paladin', spec: 'Holy', cd: 'AM' },
        { class: 'Paladin', spec: 'Retribution', cd: 'AM' },
        { class: 'Priest', spec: 'Discipline', cd: 'Hymn' },
        { class: 'Priest', spec: 'Discipline', cd: 'Barrier' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' },
        { class: 'Warrior', spec: null, cd: 'Rally' }
    ];

    let cooldownList = [];

    // Loop through the cooldown order and add players to the cooldown list
    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => ({ name: player.name, cd: cooldown.cd, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    let rows = [
        { id: 'empowered-shadows-1', cooldowns: [] },
        { id: 'empowered-shadows-2', cooldowns: [] },
        { id: 'empowered-shadows-3', cooldowns: [] },
        { id: 'empowered-shadows-4', cooldowns: [] },
        { id: 'empowered-shadows-5', cooldowns: [] },
        { id: 'empowered-shadows-6', cooldowns: [] },
        { id: 'empowered-shadows-7', cooldowns: [] }
    ];

    // Distribute players to rows
    cooldownList.forEach((player, index) => {
        if (index < rows.length) {
            rows[index].cooldowns.push(player);
        } else {
            let targetRow = rows[index % rows.length];
            if (!targetRow.cooldowns.some(cd => cd.class === player.class)) {
                targetRow.cooldowns.push(player);
            } else {
                for (let i = 0; i < rows.length; i++) {
                    if (i !== (index % rows.length) && !rows[i].cooldowns.some(cd => cd.class === player.class)) {
                        rows[i].cooldowns.push(player);
                        break;
                    }
                }
            }
        }
    });

    rows.forEach(row => {
        const shadowCell = document.getElementById(row.id);
        if (shadowCell) {
            shadowCell.textContent = row.cooldowns.map(cd => `${cd.name} | ${cd.cd}`).join(' + ');
            console.log(`${row.id}: ${shadowCell.textContent}`);
        } else {
            console.error(`Element with id ${row.id} not found`);
        }
    });
}

function copyEmpoweredShadowsMRTData() {
    const empoweredShadowsIDs = ["empowered-shadows-1", "empowered-shadows-2", "empowered-shadows-3", "empowered-shadows-4", "empowered-shadows-5", "empowered-shadows-6", "empowered-shadows-7"];
    
    let empoweredShadowsData = '|cff00ffffChogall Empowered Shadows|r\n';
    
    empoweredShadowsIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(' + ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = ability === 'AM' ? '31821' : 
                                  ability === 'Rally' ? '97462' : 
                                  ability === 'SLT' ? '98008' : 
                                  ability === 'Tranq' ? '740' : 
                                  ability === 'Barrier' ? '62618' : 
                                  ability === 'Hymn' ? '64843' : '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            empoweredShadowsData += `{{time:00:00,SAA:81572:${index + 1}}}|cffffff00Shadows#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            empoweredShadowsData += `{{time:00:00,SAA:81572:${index + 1}}}|cffffff00Shadows#0${index + 1}|r - \n`;
        }
    });

    return empoweredShadowsData;
}

function updateChogallDepravityKick() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const interruptClasses = [
        'Death Knight', 'Warrior', 'Shaman', 'Mage', 'Rogue'
    ];

    const tankSpecs = [
        'Blood', 'Protection'
    ];

    const healerSpecs = [
        'Holy', 'Discipline', 'Restoration'
    ];

    let interruptPlayers = players.filter(player =>
        interruptClasses.includes(player.playerClass) &&
        !tankSpecs.includes(player.specialization) &&
        !healerSpecs.includes(player.specialization) &&
        player.rostered
    ).map(player => player.name);

    // Ensure the players are evenly split between left and right groups
    const leftGroup = [];
    const rightGroup = [];

    interruptPlayers.forEach((player, index) => {
        if (index % 2 === 0) {
            leftGroup.push(player);
        } else {
            rightGroup.push(player);
        }
    });

    const leftGroupCell = document.getElementById('chogall-depravity-left');
    const rightGroupCell = document.getElementById('chogall-depravity-right');

    if (leftGroupCell) {
        leftGroupCell.textContent = leftGroup.join(', ');
        console.log('Left Group:', leftGroupCell.textContent);
    } else {
        console.error('Element with id chogall-depravity-left not found');
    }

    if (rightGroupCell) {
        rightGroupCell.textContent = rightGroup.join(', ');
        console.log('Right Group:', rightGroupCell.textContent);
    } else {
        console.error('Element with id chogall-depravity-right not found');
    }
}

function copyChogallKickMRTData() {
    const leftGroupCell = document.getElementById('chogall-depravity-left').textContent;
    const rightGroupCell = document.getElementById('chogall-depravity-right').textContent;

    let chogallKickData = '|cff00ffffChogall Depravity Interrupts|r\n';
    chogallKickData += `|cffffff00Interrupts LEFT{square}|r - ${leftGroupCell}\n`;
    chogallKickData += `|cffffff00Interrupts RIGHT{triangle}|r - ${rightGroupCell}\n`;

    return chogallKickData;
}

function updateChogallCorruption() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldownOrder = [
        { class: 'Paladin', spec: 'Holy', cd: 'AM' },
        { class: 'Warrior', spec: null, cd: 'Rally' },
        { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' },
        { class: 'Priest', spec: 'Discipline', cd: 'Barrier' },
        { class: 'Priest', spec: 'Discipline', cd: 'Hymn' }
    ];

    let cooldownList = [];

    // Loop through the cooldown order and add players to the cooldown list
    cooldownOrder.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => `${player.name} | ${cooldown.cd}`);

        cooldownList.push(...playerCooldowns);
    });

    // Ensure unique names, but allow Discipline Priests to use both Barrier and Hymn
    const uniqueCooldownList = [];
    const seenNames = new Set();

    cooldownList.forEach(cooldown => {
        const [playerName, cd] = cooldown.split(' | ');
        if (cd === 'Barrier' || cd === 'Hymn') {
            if (cd === 'Barrier' && !seenNames.has(playerName + ' | Barrier')) {
                uniqueCooldownList.push(cooldown);
                seenNames.add(playerName + ' | Barrier');
            } else if (cd === 'Hymn' && !seenNames.has(playerName + ' | Hymn')) {
                uniqueCooldownList.push(cooldown);
                seenNames.add(playerName + ' | Hymn');
            }
        } else if (!seenNames.has(playerName)) {
            uniqueCooldownList.push(cooldown);
            seenNames.add(playerName);
        }
    });

    const rows = [
        { id: 'chogall-corruption-1', count: 1 },
        { id: 'chogall-corruption-2', count: 1 },
        { id: 'chogall-corruption-3', count: 1 },
        { id: 'chogall-corruption-4', count: 1 },
        { id: 'chogall-corruption-5', count: 2 },
        { id: 'chogall-corruption-6', count: 2 }
    ];

    function fillRows(rows, cooldownList) {
        const filledRows = [];

        rows.forEach(row => {
            const selected = cooldownList.splice(0, row.count);
            filledRows.push(selected.join(', '));
        });

        return filledRows;
    }

    const filledRows = fillRows(rows, uniqueCooldownList);

    rows.forEach((row, index) => {
        const corruptionCell = document.getElementById(row.id);
        if (corruptionCell) {
            corruptionCell.textContent = filledRows[index];
            console.log(`${row.id}: ${corruptionCell.textContent}`);
        } else {
            console.error(`Element with id ${row.id} not found`);
        }
    });
}

function copyChogallCorruptionMRTData() {
    const times = ["00:44", "00:51", "00:58", "01:05", "01:12", "01:21"];
    const corruptionIDs = ["chogall-corruption-1", "chogall-corruption-2", "chogall-corruption-3", "chogall-corruption-4", "chogall-corruption-5", "chogall-corruption-6"];
    
    let corruptionData = '|cff00ffffChogall Corruption|r\n';
    
    corruptionIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(', ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = ability === 'AM' ? '31821' : 
                                  ability === 'Rally' ? '97462' : 
                                  ability === 'SLT' ? '98008' : 
                                  ability === 'Tranq' ? '740' : 
                                  ability === 'Barrier' ? '62618' : 
                                  ability === 'Hymn' ? '64843' : '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            corruptionData += `{{time:${times[index]},SCC:82361:1}}|cffffff00Corruption#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            corruptionData += `{{time:${times[index]},SCC:82361:1}}|cffffff00Corruption#0${index + 1}|r - \n`;
        }
    });

    return corruptionData;
}

function copyAllChogallMRTData() {
    updateEmpoweredShadows();
    updateChogallDepravityKick();
    updateChogallCorruption();

    const empoweredShadowsData = copyEmpoweredShadowsMRTData();
    const chogallKickData = copyChogallKickMRTData();
    const corruptionData = copyChogallCorruptionMRTData();

    const combinedData = `${empoweredShadowsData}\n${chogallKickData}\n${corruptionData}`;

    navigator.clipboard.writeText(combinedData).then(() => {
        alert('All Cho\'gall MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

document.getElementById('copy-all-chogall-data').addEventListener('click', copyAllChogallMRTData);








function updateSinestraFlameBreath() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Paladin', spec: 'Holy', cd: 'SAC' },
        { class: 'Paladin', spec: 'Retribution', cd: 'SAC' },
        { class: 'Priest', spec: 'Discipline', cd: 'Hymn' },
        { class: 'Priest', spec: 'Discipline', cd: 'Barrier' },
        { class: 'Warrior', spec: null, cd: 'Rally' },
        { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' },
    ];

    let cooldownList = [];

    // Loop through the cooldown order and add players to the cooldown list
    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => ({ name: player.name, cd: cooldown.cd, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    let rows = [
        { id: 'sinestra-flame-breath-1', cooldowns: [] },
        { id: 'sinestra-flame-breath-2', cooldowns: [] },
        { id: 'sinestra-flame-breath-3', cooldowns: [] },
        { id: 'sinestra-flame-breath-4', cooldowns: [] },
        { id: 'sinestra-flame-breath-5', cooldowns: [] },
        { id: 'sinestra-flame-breath-6', cooldowns: [] },
        { id: 'sinestra-flame-breath-7', cooldowns: [] },
        { id: 'sinestra-flame-breath-8', cooldowns: [] },
        { id: 'sinestra-flame-breath-9', cooldowns: [] },
        { id: 'sinestra-flame-breath-10', cooldowns: [] },
        { id: 'sinestra-flame-breath-11', cooldowns: [] },
        { id: 'sinestra-flame-breath-12', cooldowns: [] },
        { id: 'sinestra-flame-breath-13', cooldowns: [] },
        { id: 'sinestra-flame-breath-14', cooldowns: [] },
        { id: 'sinestra-flame-breath-15', cooldowns: [] },
    ];

    // Distribute players to rows
    cooldownList.forEach((player, index) => {
        if (index < rows.length) {
            rows[index].cooldowns.push(player);
        } else {
            let targetRow = rows[index % rows.length];
            if (!targetRow.cooldowns.some(cd => cd.class === player.class)) {
                targetRow.cooldowns.push(player);
            } else {
                for (let i = 0; i < rows.length; i++) {
                    if (i !== (index % rows.length) && !rows[i].cooldowns.some(cd => cd.class === player.class)) {
                        rows[i].cooldowns.push(player);
                        break;
                    }
                }
            }
        }
    });

    // Copy rows to fill additional slots
    rows[10].cooldowns.push(...rows[0].cooldowns);
    rows[11].cooldowns.push(...rows[1].cooldowns);
    rows[12].cooldowns.push(...rows[2].cooldowns);
    rows[13].cooldowns.push(...rows[3].cooldowns);
    rows[14].cooldowns.push(...rows[4].cooldowns);

    rows.forEach(row => {
        const sinestraFlameCell = document.getElementById(row.id);
        if (sinestraFlameCell) {
            sinestraFlameCell.textContent = row.cooldowns.map(cd => `${cd.name} | ${cd.cd}`).join(' + ');
            console.log(`${row.id}: ${sinestraFlameCell.textContent}`);
        } else {
            console.error(`Element with id ${row.id} not found`);
        }
    });
}

function copySinestraMRTData() {
    const flameBreathIDs = [
        "sinestra-flame-breath-1", "sinestra-flame-breath-2", "sinestra-flame-breath-3", "sinestra-flame-breath-4", 
        "sinestra-flame-breath-5", "sinestra-flame-breath-6", "sinestra-flame-breath-7", "sinestra-flame-breath-8", 
        "sinestra-flame-breath-9", "sinestra-flame-breath-10", "sinestra-flame-breath-11", "sinestra-flame-breath-12", 
        "sinestra-flame-breath-13", "sinestra-flame-breath-14", "sinestra-flame-breath-15"
    ];

    const times = ["00:00", "00:23", "00:23", "00:00", "00:23", "00:23", "00:23", "00:23", "00:23", "00:23", "00:23", "00:23", "00:23", "00:23", "00:23"];
    const wowheadIDs = {
        "SAC": "6940",
        "Hymn": "64843",
        "Barrier": "62618",
        "Rally": "97462",
        "SLT": "98008",
        "Tranq": "740"
    };

    let sinestraData = '{{time:03:11,SCC:87947:1} everyone - {spell:32182}}Heroism when Essence of the Red expires\n|cff00ff00Flame Breath CD\'s|r\n';
    
    flameBreathIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(' + ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            sinestraData += `{{time:${times[index]},SCC:90125:${index + 1}}}|cffffff00Breath#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            sinestraData += `{{time:${times[index]},SCC:90125:${index + 1}}}|cffffff00Breath#0${index + 1}|r - \n`;
        }
    });

    navigator.clipboard.writeText(sinestraData).then(() => {
        alert('Sinestra Flame Breath MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}
document.getElementById('copy-sinestra-data').addEventListener('click', copySinestraMRTData);






function updateMagmawLavaSpews() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Paladin', spec: 'Holy', cd: 'AM' },
        { class: 'Paladin', spec: 'Retribution', cd: 'AM' },
        { class: 'Priest', spec: 'Discipline', cd: 'Hymn' },
        { class: 'Priest', spec: 'Discipline', cd: 'Barrier' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' },
        { class: 'Warrior', spec: null, cd: 'Rally' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => ({ name: player.name, cd: cooldown.cd, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    let rows = [
        { id: 'magmaw-lava-spews-1', cooldowns: [] },
        { id: 'magmaw-lava-spews-2', cooldowns: [] },
        { id: 'magmaw-lava-spews-3', cooldowns: [] },
        { id: 'magmaw-lava-spews-4', cooldowns: [] },
        { id: 'magmaw-lava-spews-5', cooldowns: [] },
        { id: 'magmaw-lava-spews-6', cooldowns: [] },
        { id: 'magmaw-lava-spews-7', cooldowns: [] },
        { id: 'magmaw-lava-spews-8', cooldowns: [] },
        { id: 'magmaw-lava-spews-9', cooldowns: [] },
        { id: 'magmaw-lava-spews-10', cooldowns: [] }
    ];

    cooldownList.forEach((player, index) => {
        if (index < rows.length) {
            rows[index].cooldowns.push(player);
        } else {
            let targetRow = rows[index % rows.length];
            if (!targetRow.cooldowns.some(cd => cd.class === player.class)) {
                targetRow.cooldowns.push(player);
            } else {
                for (let i = 0; i < rows.length; i++) {
                    if (i !== (index % rows.length) && !rows[i].cooldowns.some(cd => cd.class === player.class)) {
                        rows[i].cooldowns.push(player);
                        break;
                    }
                }
            }
        }
    });

    rows[7].cooldowns.push(...rows[0].cooldowns);
    rows[8].cooldowns.push(...rows[1].cooldowns);
    rows[9].cooldowns.push(...rows[2].cooldowns);

    rows.forEach(row => {
        const magmawLavaCell = document.getElementById(row.id);
        if (magmawLavaCell) {
            magmawLavaCell.textContent = row.cooldowns.map(cd => `${cd.name} | ${cd.cd}`).join(' + ');
        }
    });

    return rows;
}

function updateMagmawMangle() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Paladin', spec: 'Holy', cd: 'SAC' },
        { class: 'Paladin', spec: 'Retribution', cd: 'SAC' },
        { class: 'Priest', spec: 'Discipline', cd: 'PS' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => ({ name: player.name, cd: cooldown.cd, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    let rows = [
        { id: 'magmaw-mangle-1', cooldowns: [] },
        { id: 'magmaw-mangle-2', cooldowns: [] },
        { id: 'magmaw-mangle-3', cooldowns: [] }
    ];

    cooldownList.forEach((player, index) => {
        if (index < rows.length) {
            rows[index].cooldowns.push(player);
        } else {
            let targetRow = rows[index % rows.length];
            if (!targetRow.cooldowns.some(cd => cd.class === player.class)) {
                targetRow.cooldowns.push(player);
            } else {
                for (let i = 0; i < rows.length; i++) {
                    if (i !== (index % rows.length) && !rows[i].cooldowns.some(cd => cd.class === player.class)) {
                        rows[i].cooldowns.push(player);
                        break;
                    }
                }
            }
        }
    });

    rows.forEach(row => {
        const magmawMangleCell = document.getElementById(row.id);
        if (magmawMangleCell) {
            magmawMangleCell.textContent = row.cooldowns.map(cd => `${cd.name} | ${cd.cd}`).join(' + ');
        }
    });

    return rows;
}

function copyMagmawData() {
    const lavaSpewsRows = updateMagmawLavaSpews();
    const mangleRows = updateMagmawMangle();

    const spellIDs = {
        'AM': 31821,
        'SAC': 64205,
        'Hymn': 64843,
        'Barrier': 62618,
        'Tranq': 740,
        'Rally': 97462,
        'PS': 33206
    };
	let result = '|cff00ffffMagmaw|r\n';
    result += '|cff00ff00Spew CDs|r\n';
	result += '{{time:00:30,SCC:77690:13} everyone - {spell:32182}}Heroism second Expose phase, fight time: ~3:30\n';
    lavaSpewsRows.forEach((row, index) => {
        const rowNumber = index + 1;
        const cooldowns = row.cooldowns.map(cd => {
            const spellID = spellIDs[cd.cd] || 'UnknownSpellID';
            return `${cd.name} {spell:${spellID}}`;
        }).join('  ');

        result += `{{time:00:00,SCC:77690:${rowNumber * 3 - 2}}}|cffffff00Spew#${rowNumber.toString().padStart(2, '0')}|r - ${cooldowns}\n`;
    });
	result += '\n';
	result += '|cff00ff00Mangle CDs|r\n';

    
    mangleRows.forEach((row, index) => {
        const rowNumber = index + 1;
        const cooldowns = row.cooldowns.map(cd => {
            const spellID = spellIDs[cd.cd] || 'UnknownSpellID';
            return `${cd.name} {spell:${spellID}}`;
        }).join('  ');

        result += `{{time:00:00,SAA:89773:${rowNumber}}}|cffffff00Mangle#${rowNumber.toString().padStart(2, '0')}|r - ${cooldowns}\n`;
    });

    navigator.clipboard.writeText(result).then(() => {
        alert('Magmaw data copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

document.getElementById('copy-magmaw-data').addEventListener('click', copyMagmawData);





function updateOmnotronIncinerationSecurityMeasure() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldownOrder = [
        { class: 'Paladin', spec: 'Holy', cd: 'AM' },
        { class: 'Priest', spec: 'Discipline', cd: 'Barr' },
        { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' }
    ];

    let cooldownList = [];

    // Loop through the cooldown order and add players to the cooldown list
    cooldownOrder.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            player.specialization === cooldown.spec &&
            player.rostered
        ).map(player => ({ name: `${player.name} | ${cooldown.cd}`, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    // Separate Holy Paladins from other cooldowns
    let holyPaladins = cooldownList.filter(cd => cd.class === 'Paladin');
    let others = cooldownList.filter(cd => cd.class !== 'Paladin');

    // Ensure we have enough cooldowns by repeating if necessary
    const totalRequired = 6;
    if (holyPaladins.length > 0) {
        while (holyPaladins.length < totalRequired / 2 && holyPaladins.length < cooldownList.length / 2) {
            holyPaladins = holyPaladins.concat(holyPaladins);
        }
    }

    if (others.length > 0) {
        while (others.length < totalRequired && others.length < cooldownList.length) {
            others = others.concat(others);
        }
    }

    holyPaladins = holyPaladins.slice(0, 2); // Trim to 2 Holy Paladins
    others = others.slice(0, totalRequired); // Trim to exact needed length

    // Generate the incineration table
    const incinerationTable = [
        { id: 'incinerate-1', cooldowns: `${holyPaladins[0]?.name || 'N/A'}` },
        { id: 'incinerate-2', cooldowns: `${holyPaladins[1]?.name || 'N/A'}` },
        { id: 'incinerate-3', cooldowns: `${holyPaladins[0]?.name || 'N/A'}` },
        { id: 'incinerate-4', cooldowns: `${holyPaladins[1]?.name || 'N/A'}` },
        { id: 'incinerate-5', cooldowns: `${holyPaladins[0]?.name || 'N/A'}` },
        { id: 'incinerate-6', cooldowns: `${holyPaladins[1]?.name || 'N/A'}` },
    ];

    // Fill the remaining cells with other cooldowns
    let othersIndex = 0;
    for (let i = 0; i < incinerationTable.length; i++) {
        while (othersIndex < others.length) {
            const other = others[othersIndex];
            if (other && !incinerationTable[i].cooldowns.includes(other.name)) {
                incinerationTable[i].cooldowns += ` + ${other.name}`;
                othersIndex++;
                break;
            }
            othersIndex++;
        }
    }

    // Fill the table rows
    incinerationTable.forEach(entry => {
        const incinerationCell = document.getElementById(entry.id);
        if (incinerationCell) {
            incinerationCell.textContent = entry.cooldowns;
            console.log(`${entry.id}: ${incinerationCell.textContent}`);
        } else {
            console.error(`Element with id ${entry.id} not found`);
        }
    });
}

function updateOmnotronGripOfDeath() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    // Filter Druids with Roar ability
    const druids = players.filter(player =>
        player.playerClass === 'Druid' &&
        player.rostered
    ).map((player, index) => ({ name: player.name, cd: 'Roar', id: `druid-${index + 1}` }));

    // Ensure unique Druids and only as many as needed
    const uniqueDruids = [...new Map(druids.map(druid => [druid.name, druid])).values()];
    const totalRequired = 3;
    const druidCooldowns = uniqueDruids.slice(0, totalRequired);

    // Generate the grip of death table
    const gripOfDeathTable = [];
    for (let i = 0; i < totalRequired; i++) {
        const druid = druidCooldowns[i];
        if (druid) {
            gripOfDeathTable.push({ id: `grip-${i + 1}`, cooldowns: `${druid.name} | ${druid.cd}` });
        } else {
            gripOfDeathTable.push({ id: `grip-${i + 1}`, cooldowns: '' });
        }
    }

    // Fill the table rows
    gripOfDeathTable.forEach(entry => {
        const gripCell = document.getElementById(entry.id);
        if (gripCell) {
            gripCell.textContent = entry.cooldowns;
            console.log(`${entry.id}: ${gripCell.textContent}`);
        } else {
            console.error(`Element with id ${entry.id} not found`);
        }
    });
}

function copyMagmatronData() {
    const incinerationIDs = ["incinerate-1", "incinerate-2", "incinerate-3", "incinerate-4", "incinerate-5", "incinerate-6"];
    const gripIDs = ["grip-1", "grip-2", "grip-3"];

    const wowheadIDs = {
        "AM": "31821",
        "Barr": "62618",
        "SLT": "98008",
        "Tranq": "740",
        "Roar": "77761"
    };

    let magmatronData = '|cff00ffffOmnotron|r\nHeroism 5 seconds into the fight\n|cff00ff00Incinerate CDs|r\n';

    incinerationIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(' + ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            magmatronData += `{{time:00:00,SCS:79035:${index + 1}}}|cffffff00Flames#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            magmatronData += `{{time:00:00,SCS:79035:${index + 1}}}|cffffff00Flames#0${index + 1}|r - \n`;
        }
    });

    magmatronData += '\n|cff00ff00Grip of Death|r\n';

    gripIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(' + ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            magmatronData += `{{time:00:00,SCS:91849:${index + 1}}}|cffffff00AoEgrip#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            magmatronData += `{{time:00:00,SCS:91849:${index + 1}}}|cffffff00AoEgrip#0${index + 1}|r - \n`;
        }
    });

    navigator.clipboard.writeText(magmatronData).then(() => {
        alert('Magmatron MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

document.getElementById('copy-magmatron-data').addEventListener('click', () => {
    updateOmnotronIncinerationSecurityMeasure();
    updateOmnotronGripOfDeath();
    copyMagmatronData();
});





function updateChimaeronSlime() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    console.log("Players loaded from storage:", players);

    const cooldowns = [
        { class: 'Priest', spec: 'Discipline', cd: ['Barrier', 'Hymn'] },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' },
        { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
        { class: 'Warrior', spec: null, cd: 'Rally' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => {
            if (Array.isArray(cooldown.cd)) {
                return cooldown.cd.map(cd => ({ name: player.name, ability: cd }));
            } else {
                return { name: player.name, ability: cooldown.cd };
            }
        }).flat();

        cooldownList.push(...playerCooldowns);
    });

    const rows = [
        { id: 'slime-1', cooldowns: ['Barrier', 'Tranq', 'Rally'] },
        { id: 'slime-2', cooldowns: ['SLT', 'Rally'] },
        { id: 'slime-3', cooldowns: ['Tranq', 'Hymn'] }
    ];

    rows.forEach(row => {
        let usedPlayers = new Set();
        const rowCooldowns = row.cooldowns.map(ability => {
            const cooldown = cooldownList.find(cd => cd.ability === ability && !usedPlayers.has(cd.name));
            if (cooldown) {
                usedPlayers.add(cooldown.name);
                return `${cooldown.name} | ${cooldown.ability}`;
            } else {
                return '';
            }
        }).filter(cd => cd !== '');

        const fuedCell = document.getElementById(row.id);
        if (fuedCell) {
            fuedCell.textContent = rowCooldowns.join(', ');
        }
    });
}

function updateChimaeronFuedSpeed() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const druids = players.filter(player =>
        player.playerClass === 'Druid' &&
        player.rostered
    ).map((player, index) => ({ name: player.name, cd: 'Roar', id: `druid-${index + 1}` }));

    const uniqueDruids = [...new Map(druids.map(druid => [druid.name, druid])).values()];
    const totalRequired = 3;
    const druidCooldowns = uniqueDruids.slice(0, totalRequired);

    const chimaeronFuedSpeed = [];
    for (let i = 0; i < totalRequired; i++) {
        const druid = druidCooldowns[i];
        if (druid) {
            chimaeronFuedSpeed.push({ id: `fued-speed-${i + 1}`, cooldowns: `${druid.name} | ${druid.cd}` });
        } else {
            chimaeronFuedSpeed.push({ id: `fued-speed-${i + 1}`, cooldowns: '' });
        }
    }

    chimaeronFuedSpeed.forEach(entry => {
        const fuedSpeedCell = document.getElementById(entry.id);
        if (fuedSpeedCell) {
            fuedSpeedCell.textContent = entry.cooldowns;
        }
    });
}

function updateChimaeronFuedLayOnHands() {
    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Paladin', spec: null, cd: 'Lay on hands' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            player.rostered
        ).map(player => ({ name: `${player.name} | ${cooldown.cd}`, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    cooldownList = [...new Set(cooldownList)];

    const totalRequired = 3;
    const layOnHandsTable = [
        { id: 'lay-on-hands-1', cooldowns: cooldownList[0] ? cooldownList[0].name : '' },
        { id: 'lay-on-hands-2', cooldowns: cooldownList[1] ? cooldownList[1].name : '' },
        { id: 'lay-on-hands-3', cooldowns: cooldownList[2] ? cooldownList[2].name : '' }
    ];

    layOnHandsTable.forEach((entry, index) => {
        const layOnHandsCell = document.getElementById(entry.id);
        if (layOnHandsCell) {
            layOnHandsCell.textContent = entry.cooldowns;
        }
    });
}

function copyChimaeronData() {
    const slimeIDs = ["slime-1", "slime-2", "slime-3"];
    const fuedSpeedIDs = ["fued-speed-1", "fued-speed-2", "fued-speed-3"];
    const layOnHandsIDs = ["lay-on-hands-1", "lay-on-hands-2", "lay-on-hands-3"];

    const wowheadIDs = {
        "Barrier": "62618",
        "Hymn": "64843",
        "Tranq": "740",
        "SLT": "98008",
        "Rally": "97462",
        "Roar": "77761",
        "Lay on hands": "633"
    };

    let chimaeronData = '|cff00ffffChimaeron|r\n{{time:00:05,e,HPS_chimaeron_23} everyone - {spell:32182}}Heroism at 22% boss hp\n|cff00ff00Caustic Slime CDs|r\n';

    slimeIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(', ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            chimaeronData += `{{time:00:14,SCC:88872:${index + 1}}}|cffffff00Slime#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            chimaeronData += `{{time:00:14,SCC:88872:${index + 1}}}|cffffff00Slime#0${index + 1}|r - \n`;
        }
    });
	
	chimaeronData += '\n';
    chimaeronData += '|cff00ffffFued LoH order per fued|r\n';

    layOnHandsIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(', ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            chimaeronData += `{{time:00:19,SCC:88872:${index + 1}}}|cffffff00Feud#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            chimaeronData += `{{time:00:19,SCC:88872:${index + 1}}}|cffffff00Feud#0${index + 1}|r - \n`;
        }
    });
	chimaeronData += '\n';
    chimaeronData += '|cff00ff00After Stack Speedboost|r\n';

    fuedSpeedIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(', ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            chimaeronData += `{{time:00:30,SCC:88872:${index + 1}}}|cffffff00Roar#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            chimaeronData += `{{time:00:30,SCC:88872:${index + 1}}}|cffffff00Roar#0${index + 1}|r - \n`;
        }
    });

    navigator.clipboard.writeText(chimaeronData).then(() => {
        alert('Chimaeron MRT data copied to clipboard');
    }, (err) => {
        console.error('Could not copy MRT data: ', err);
    });
}

document.getElementById('copy-chimaeron-data').addEventListener('click', () => {
    updateChimaeronSlime();
    updateChimaeronFuedSpeed();
    updateChimaeronFuedLayOnHands();
    copyChimaeronData();
});



function updateMaloriakEngulfingDarkness() {
    console.log("updateMaloriakEngulfingDarkness function called");

    const players = JSON.parse(localStorage.getItem('players')) || [];
    console.log("Players loaded from storage:", players);

    const cooldowns = [
        { class: 'Paladin', spec: null, cd: 'Sac' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            player.rostered
        ).map(player => ({ name: `${player.name} | ${cooldown.cd}`, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    cooldownList = cooldownList.slice(0, cooldownList.length);

    const engulfingDarknessTable = [
        { id: 'darkness-1', cooldowns: '' },
        { id: 'darkness-2', cooldowns: '' },
        { id: 'darkness-3', cooldowns: cooldownList[0] ? cooldownList[0].name : '' },
        { id: 'darkness-4', cooldowns: cooldownList[1] ? cooldownList[1].name : '' },
        { id: 'darkness-5', cooldowns: cooldownList[2] ? cooldownList[2].name : '' },
        { id: 'darkness-6', cooldowns: '' },
        { id: 'darkness-7', cooldowns: '' }
    ];

    engulfingDarknessTable.forEach((entry, index) => {
        const darknessCell = document.getElementById(entry.id);
        if (darknessCell) {
            darknessCell.textContent = entry.cooldowns;
            console.log(`${entry.id}: ${darknessCell.textContent}`);
        } else {
            console.error(`Element with id ${entry.id} not found`);
        }
    });
}

function updateMaloriakScorchingBlast() {
    console.log("updateMaloriakScorchingBlast function called");

    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Priest', spec: 'Discipline', cd: 'Barr' },
        { class: 'Paladin', spec: 'Holy', cd: 'AM' },
        { class: 'Paladin', spec: 'Protection', cd: 'AM' },
        { class: 'Paladin', spec: 'Retribution', cd: 'AM' },
        { class: 'Warrior', cd: 'Rally' },
        { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => ({ name: player.name, ability: cooldown.cd, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    function addCooldowns(rowId, cooldowns, usedPlayers, usedClasses) {
        let rowCooldowns = [];

        cooldowns.forEach(cooldown => {
            if (rowCooldowns.length < 3 && !usedPlayers.has(cooldown.name) && !usedClasses.has(cooldown.class)) {
                rowCooldowns.push(`${cooldown.name} | ${cooldown.ability}`);
                usedPlayers.add(cooldown.name);
                usedClasses.add(cooldown.class);
            }
        });

        const rowCell = document.getElementById(rowId);
        if (rowCell) {
            rowCell.textContent = rowCooldowns.join(' + ');
            console.log(`${rowId}: ${rowCell.textContent}`);
        } else {
            console.error(`Element with id ${rowId} not found`);
        }
    }

    const disciplinePriests = cooldownList.filter(cd => cd.ability === 'Barr');
    const paladins = cooldownList.filter(cd => cd.ability === 'AM');
    const warriors = cooldownList.filter(cd => cd.ability === 'Rally');
    const shamans = cooldownList.filter(cd => cd.ability === 'SLT');
    const druids = cooldownList.filter(cd => cd.ability === 'Tranq');

    const scorchingBlastTable = [
        { id: 'blast-1', cooldowns: [...paladins, ...disciplinePriests, ...warriors, ...shamans, ...druids] },
        { id: 'blast-2', cooldowns: [...paladins, ...disciplinePriests, ...warriors, ...shamans, ...druids] }
    ];

    let usedPlayers = new Set();
    let usedClasses = new Set();

    scorchingBlastTable.forEach((entry, index) => {
        addCooldowns(entry.id, entry.cooldowns, usedPlayers, usedClasses);
        usedClasses.clear();
    });
}

function updateMaloriakAssistKiter() {
    console.log("updateMaloriakAssistKiter function called");

    const players = JSON.parse(localStorage.getItem('players')) || [];
    console.log("Players loaded from storage:", players);

    const mages = players.filter(player =>
        player.playerClass === 'Mage' &&
        player.rostered
    ).map(player => ({ name: player.name, ability: 'Ring of Frost' }));

    const others = players.filter(player =>
        player.playerClass !== 'Mage' &&
        player.rostered
    ).map(player => ({ name: player.name, ability: 'Assist Kiter' }));

    let assistKiterTable = [];

    const totalRequired = 3;
    let mageIndex = 0;
    let otherIndex = 0;

    for (let i = 0; i < totalRequired; i++) {
        if (mageIndex < mages.length) {
            assistKiterTable.push({ id: `assist-kiter-${i + 1}`, cooldowns: `${mages[mageIndex].name} | ${mages[mageIndex].ability}` });
            mageIndex++;
        } else if (otherIndex < others.length) {
            assistKiterTable.push({ id: `assist-kiter-${i + 1}`, cooldowns: `${others[otherIndex].name} | ${others[otherIndex].ability}` });
            otherIndex++;
        } else {
            assistKiterTable.push({ id: `assist-kiter-${i + 1}`, cooldowns: '' });
        }
    }

    assistKiterTable.forEach((entry, index) => {
        const assistKiterCell = document.getElementById(entry.id);
        if (assistKiterCell) {
            assistKiterCell.textContent = entry.cooldowns;
            console.log(`${entry.id}: ${assistKiterCell.textContent}`);
        } else {
            console.error(`Element with id ${entry.id} not found`);
        }
    });
}

function copyMaloriakData() {
    const darknessIDs = ["darkness-1", "darkness-2", "darkness-3", "darkness-4", "darkness-5", "darkness-6", "darkness-7"];
    const blastIDs = ["blast-1", "blast-2"];
    const assistKiterIDs = ["assist-kiter-1", "assist-kiter-2", "assist-kiter-3"];

    const wowheadIDs = {
        "Sac": "64205",
        "Barr": "62618",
        "AM": "31821",
        "Rally": "97462",
        "SLT": "98008",
        "Tranq": "740",
        "Ring of Frost": "82676",
        "Assist Kiter": "12345"
    };

    let maloriakData = '|cff00ff00Darkness|r\n';

    darknessIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(', ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            maloriakData += `{{time:00:00,SCS:92754:${index + 1}}}|cffffff00Darkness#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            maloriakData += `{{time:00:00,SCS:92754:${index + 1}}}|cffffff00Darkness#0${index + 1}|r - \n`;
        }
    });
	
	maloriakData += '\n';
    maloriakData += '|cff00ffffMaloriak|r\n{{time:00:05,SCC:78225:1} everyone - {spell:32182}}Heroism start final phase\n|cff00ff00Scorching Blast|r\n';

    blastIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(' + ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            maloriakData += `{{time:00:11,SCC:77786:${index + 1}}}|cffffff00Blast#0${index + 1}}|r - ${cooldowns}\n`;
        } else {
            maloriakData += `{{time:00:11,SCC:77786:${index + 1}}}|cffffff00Blast#0${index + 1}}|r - \n`;
        }
    });
	
	maloriakData += '\n';
    maloriakData += '|cff00ff00Assist kiter - RoF + Frostnova|r\n';

    assistKiterIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const [player, ability] = cell.textContent.split(' | ');
            const wowheadID = wowheadIDs[ability] || '';
            maloriakData += `{{time:00:00,SCC:77991:${index + 1}}}|cffffff00RoF#0${index + 1}|r - ${player} {spell:${wowheadID}}\n`;
        } else {
            maloriakData += `{{time:00:00,SCC:77991:${index + 1}}}|cffffff00RoF#0${index + 1}|r - \n`;
        }
    });

    console.log("Combined Maloriak Data MRT Note:", maloriakData);
    navigator.clipboard.writeText(maloriakData).then(() => {
        console.log("Maloriak data copied to clipboard!");
        alert("Maloriak data copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy Maloriak data to clipboard: ", err);
    });
}

document.getElementById('copy-maloriak-data').addEventListener('click', () => {
    updateMaloriakEngulfingDarkness();
    updateMaloriakScorchingBlast();
    updateMaloriakAssistKiter();
    copyMaloriakData();
});






function updateAtramedesIncinerate() {
    console.log("updateAtramedesIncinerate function called");

    const players = JSON.parse(localStorage.getItem('players')) || [];

    const cooldowns = [
        { class: 'Priest', spec: 'Discipline', cd: 'Barr' },
        { class: 'Paladin', spec: 'Holy', cd: 'AM' },
        { class: 'Paladin', spec: 'Protection', cd: 'AM' },
        { class: 'Paladin', spec: 'Retribution', cd: 'AM' },
        { class: 'Warrior', cd: 'Rally' },
        { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
        { class: 'Druid', spec: 'Restoration', cd: 'Tranq' }
    ];

    let cooldownList = [];

    cooldowns.forEach(cooldown => {
        const playerCooldowns = players.filter(player =>
            player.playerClass === cooldown.class &&
            (cooldown.spec ? player.specialization === cooldown.spec : true) &&
            player.rostered
        ).map(player => ({ name: player.name, ability: cooldown.cd, class: cooldown.class }));

        cooldownList.push(...playerCooldowns);
    });

    let row1Cooldowns = [];
    let row2Cooldowns = [];
    let classCount = {};

    cooldowns.forEach(cooldown => {
        classCount[cooldown.class] = 0;
    });

    cooldownList.forEach(cooldown => {
        if (classCount[cooldown.class] < 2) {
            if (row1Cooldowns.length <= row2Cooldowns.length && !row1Cooldowns.some(cd => cd.includes(cooldown.class))) {
                row1Cooldowns.push(`${cooldown.name} | ${cooldown.ability}`);
                classCount[cooldown.class]++;
            } else if (!row2Cooldowns.some(cd => cd.includes(cooldown.class))) {
                row2Cooldowns.push(`${cooldown.name} | ${cooldown.ability}`);
                classCount[cooldown.class]++;
            }
        }
    });

    const row1Cell = document.getElementById('mal-incinerate-1');
    const row2Cell = document.getElementById('mal-incinerate-2');

    if (row1Cell) {
        row1Cell.textContent = row1Cooldowns.join(' + ');
    }

    if (row2Cell) {
        row2Cell.textContent = row2Cooldowns.join(' + ');
    }
}

function copyAtramedesData() {
    const incinerateIDs = ["mal-incinerate-1", "mal-incinerate-2"];

    const wowheadIDs = {
        "Barr": "62618",
        "AM": "31821",
        "Rally": "97462",
        "SLT": "98008",
        "Tranq": "740"
    };

    let atramedesData = '|cff00ffffAtramedes|r\nHeroism 5 seconds into the fight\n|cff00ff00PRECAST CDs for Searing Flame|r\n';

    incinerateIDs.forEach((id, index) => {
        const cell = document.getElementById(id);
        if (cell && cell.textContent) {
            const cooldowns = cell.textContent.split(' + ').map(cd => {
                const [player, ability] = cd.split(' | ');
                const wowheadID = wowheadIDs[ability] || '';
                return `${player} {spell:${wowheadID}}`;
            }).join(' ');
            atramedesData += `{{time:00:${index === 0 ? '02' : '10'},SCC:77672:${index + 3}}}|cffffff00Searing#0${index + 1}|r - ${cooldowns}\n`;
        } else {
            atramedesData += `{{time:00:${index === 0 ? '02' : '10'},SCC:77672:${index + 3}}}|cffffff00Searing#0${index + 1}|r - \n`;
        }
    });

    console.log("Combined Atramedes Data MRT Note:", atramedesData);
    navigator.clipboard.writeText(atramedesData).then(() => {
        console.log("Atramedes data copied to clipboard!");
        alert("Atramedes data copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy Atramedes data to clipboard: ", err);
    });
}

document.getElementById('copy-atramedes-data').addEventListener('click', () => {
    updateAtramedesIncinerate();
    copyAtramedesData();
});






function updateNefarianElectrocute() {
        const players = JSON.parse(localStorage.getItem('players')) || [];

        const cooldownOrder = [
            { class: 'Priest', spec: 'Discipline', cd: 'Barrier' },
            { class: 'Warrior', spec: null, cd: 'Rally' },
            { class: 'Shaman', spec: 'Restoration', cd: 'SLT' },
            { class: 'Druid', spec: 'Restoration', cd: 'Tranq' },
            { class: 'Paladin', spec: 'Holy', cd: 'SAC' },
            { class: 'Paladin', spec: 'Protection', cd: 'SAC' },
            { class: 'Paladin', spec: 'Retribution', cd: 'SAC' },
            { class: 'Priest', spec: 'Discipline', cd: 'Hymn' },
            { class: 'Priest', spec: 'Discipline', cd: 'PS' }
        ];

        let cooldownList = [];

        cooldownOrder.forEach(cooldown => {
            const playerCooldowns = players.filter(player =>
                player.playerClass === cooldown.class &&
                (cooldown.spec ? player.specialization === cooldown.spec : true) &&
                player.rostered
            ).map(player => ({ name: player.name, cd: cooldown.cd, class: cooldown.class }));

            cooldownList.push(...playerCooldowns);
        });

        const rows = [
            { id: 'zap-1', cooldowns: ['Priest | Barrier', 'Warrior | Rally'] },
            { id: 'zap-2', cooldowns: ['Shaman | SLT', 'Druid | Tranq', 'Warrior | Rally'] },
            { id: 'zap-3', cooldowns: ['Druid | Tranq', 'Paladin | SAC'] },
            { id: 'zap-4', cooldowns: ['Paladin | SAC'] },
            { id: 'zap-5', cooldowns: ['Priest | Barrier'] },
            { id: 'zap-6', cooldowns: ['Shaman | SLT', 'Priest | PS'] },
            { id: 'zap-7', cooldowns: ['Druid | Tranq', 'Warrior | Rally', 'Paladin | SAC'] },
            { id: 'zap-8', cooldowns: ['Priest | Hymn', 'Warrior | Rally'] },
            { id: 'zap-9', cooldowns: ['Druid | Tranq'] }
        ];

        let usedPlayers = new Set();
        let playerCooldownUsage = new Map();

        function addCooldownToRow(row, cooldownList) {
            let rowCooldowns = [];
            let rowUsedClasses = new Set();

            row.cooldowns.forEach(cd => {
                const [className, ability] = cd.split(' | ');
                const cooldown = cooldownList.find(c => 
                    c.class.toLowerCase() === className.toLowerCase() && 
                    c.cd === ability && 
                    !usedPlayers.has(c.name) && 
                    !rowUsedClasses.has(c.class)
                );
                if (cooldown) {
                    rowCooldowns.push(`${cooldown.name} | ${cooldown.cd}`);
                    usedPlayers.add(cooldown.name);
                    rowUsedClasses.add(cooldown.class);

                    if (!playerCooldownUsage.has(cooldown.name)) {
                        playerCooldownUsage.set(cooldown.name, []);
                    }
                    playerCooldownUsage.get(cooldown.name).push({ cd: cooldown.cd, row: row.id });
                }
            });

            return rowCooldowns;
        }

        function canReuseCooldown(player, cd, currentRow) {
            if (!playerCooldownUsage.has(player)) {
                return true;
            }
            const usage = playerCooldownUsage.get(player);
            return usage.every(u => u.cd !== cd || Math.abs(parseInt(currentRow.split('-')[1]) - parseInt(u.row.split('-')[1])) >= 4);
        }

        rows.forEach((row, index) => {
            let rowCooldowns = addCooldownToRow(row, cooldownList);

            if (rowCooldowns.length < row.cooldowns.length) {
                let remainingCooldowns = row.cooldowns.filter(cd => !rowCooldowns.some(r => r.includes(cd.split(' | ')[1])));
                remainingCooldowns.forEach(cd => {
                    const [className, ability] = cd.split(' | ');
                    const cooldown = cooldownList.find(c => 
                        c.class.toLowerCase() === className.toLowerCase() && 
                        c.cd === ability && 
                        canReuseCooldown(c.name, c.cd, row.id)
                    );
                    if (cooldown) {
                        rowCooldowns.push(`${cooldown.name} | ${cooldown.cd}`);
                        usedPlayers.add(cooldown.name);

                        if (!playerCooldownUsage.has(cooldown.name)) {
                            playerCooldownUsage.set(cooldown.name, []);
                        }
                        playerCooldownUsage.get(cooldown.name).push({ cd: cooldown.cd, row: row.id });
                    }
                });
            }

            const rowCell = document.getElementById(row.id);
            if (rowCell) {
                rowCell.textContent = rowCooldowns.join(' + ');
                console.log(`${row.id}: ${rowCell.textContent}`);
            } else {
                console.error(`Element with id ${row.id} not found`);
            }
        });
    }

    function updateNefarianGroups() {
        const players = JSON.parse(localStorage.getItem('players')) || [];
        console.log("Players loaded from storage:", players);

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        const shuffledPlayers = shuffle(players.filter(player => player.rostered));
        const groupSize = Math.ceil(shuffledPlayers.length / 3);

        const leftGroup = shuffledPlayers.slice(0, groupSize);
        const southGroup = shuffledPlayers.slice(groupSize, groupSize * 2);
        const rightGroup = shuffledPlayers.slice(groupSize * 2);

        function populateGroupTable(group, tableId) {
            const tableBody = document.getElementById(tableId);
            tableBody.innerHTML = '';

            group.forEach((player, index) => {
                const row = document.createElement('tr');
                const cellIndex = document.createElement('td');
                const cellPlayer = document.createElement('td');

                cellIndex.textContent = index + 1;
                cellPlayer.textContent = player.name;

                row.appendChild(cellIndex);
                row.appendChild(cellPlayer);
                tableBody.appendChild(row);
            });
        }

        populateGroupTable(leftGroup, 'left-group-body');
        populateGroupTable(southGroup, 'south-group-body');
        populateGroupTable(rightGroup, 'right-group-body');
    }

    function copyNefarianData() {
        const zapIDs = ["zap-1", "zap-2", "zap-3", "zap-4", "zap-5", "zap-6", "zap-7", "zap-8", "zap-9"];
        const leftGroupIDs = ["left-group-body"];
        const southGroupIDs = ["south-group-body"];
        const rightGroupIDs = ["right-group-body"];

        const wowheadIDs = {
            "Barrier": "62618",
            "Rally": "97462",
            "SLT": "98008",
            "Tranq": "740",
            "SAC": "6940",
            "Hymn": "64843",
            "PS": "33206"
        };

        let nefarianData = '|cff00ff00CDs for Electrocute|r\nHeroism ~4:00 - after first MC\'s in P3\n';

        zapIDs.forEach((id, index) => {
            const cell = document.getElementById(id);
            if (cell && cell.textContent) {
                const cooldowns = cell.textContent.split(' + ').map(cd => {
                    const [player, ability] = cd.split(' | ');
                    const wowheadID = wowheadIDs[ability] || '';
                    return `${player} {spell:${wowheadID}}`;
                }).join(' ');
                nefarianData += `{{time:00:03,e,HPS_nef_${90 - (index * 10)}}}|cffffff00Zap#0${index + 1}|r - ${cooldowns}\n`;
            } else {
                nefarianData += `{{time:00:03,e,HPS_nef_${90 - (index * 10)}}}|cffffff00Zap#0${index + 1}|r - \n`;
            }
        });
		
		nefarianData += '\n';
        nefarianData += '|cff00ffffNefarian|r\n';

        const groups = [
            { id: 'left-group-body', name: 'LEFT platform', icon: '{square}' },
            { id: 'south-group-body', name: 'SOUTH platform', icon: '{diamond}' },
            { id: 'right-group-body', name: 'RIGHT platform', icon: '{triangle}' }
        ];

        groups.forEach(group => {
            const tableBody = document.getElementById(group.id);
            if (tableBody) {
                const playerNames = Array.from(tableBody.getElementsByTagName('td')).map(td => td.textContent).filter((name, index) => index % 2 === 1);
                nefarianData += `|cff00ff00${group.icon} ${group.name}|r\n${playerNames.join(', ')}\n`;
            }
        });

        console.log("Combined Nefarian Data MRT Note:", nefarianData);
        navigator.clipboard.writeText(nefarianData).then(() => {
            console.log("Nefarian data copied to clipboard!");
            alert("Nefarian data copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy Nefarian data to clipboard: ", err);
        });
    }

    document.getElementById('copy-nefarian-data').addEventListener('click', () => {
        updateNefarianElectrocute();
        updateNefarianGroups();
        copyNefarianData();
    });


function updateAll() {
	updateMaloriakAssistKiter();
    updateSleetStorm();
    updateAlakirGroups();
    updateAlAkirAcid();
    updateHalfusBreath();
    updateHalfusRoar();
    updateVTBlackouts();
    updateVTShadowRealmGroups();
    updateCouncilAegis();
    updateElectricInstability();
    updateFinalPhasePositions();
    updateEmpoweredShadows();
    updateChogallDepravityKick();
    updateChogallCorruption();
    updateSinestraFlameBreath();
    updateMagmawLavaSpews();
    updateMagmawMangle();
    updateOmnotronIncinerationSecurityMeasure();
    updateOmnotronGripOfDeath();
    updateChimaeronSlime(); // Ensure this line is included
	updateChimaeronFuedSpeed();
	updateChimaeronFuedLayOnHands();
	updateMaloriakEngulfingDarkness();
	updateMaloriakScorchingBlast();
	updateAtramedesIncinerate();
	updateNefarianElectrocute();
	updateNefarianGroups();
    console.log("updateAll function completed");
}

loadPlayersFromStorage();




});
