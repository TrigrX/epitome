import requests

# Fetch JSON data
url = 'https://raid-helper.dev/api/v2/events/1263435140558749727'
response = requests.get(url)
data = response.json()

# Process JSON data
if 'event' in data and 'raidplan' in data['event']:
    raidplan = data['event']['raidplan']
    confirmed_players = [player for player in raidplan if player.get('isConfirmed') == 'confirmed']

    groups = {}
    for player in confirmed_players:
        party_id = player['partyId']
        slot_id = player['slotId'] - 1
        if party_id not in groups:
            groups[party_id] = [None] * 5  # Assuming 5 slots per group
        groups[party_id][slot_id] = player

    # Generate HTML
    html_content = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Raid Planner</title>
    </head>
    <body>
        <div>
            <h3>Player Groups</h3>
            <table id="player-groups">
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>Slot</th>
                        <th>Player</th>
                    </tr>
                </thead>
                <tbody>
    '''

    for party_id, group in groups.items():
        for slot_index, player in enumerate(group):
            slot_number = slot_index + 1
            player_name = player['name'] if player else 'Empty Slot'
            html_content += f'''
            <tr>
                <td>Group {party_id}</td>
                <td>Slot {slot_number}</td>
                <td>{player_name}</td>
            </tr>
            '''

    html_content += '''
                </tbody>
            </table>
        </div>
    </body>
    </html>
    '''

    # Write HTML to file
    with open('index.html', 'w') as file:
        file.write(html_content)
else:
    print('Unexpected data format')
