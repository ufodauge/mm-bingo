import csv


def main():
    data = []
    with open('tasklist.csv', 'r', encoding="utf-8") as f:
        reader = csv.reader(f)

        for row in reader:
            data.append({
                "difficulty": row[2],
                "contents": {
                    "ja": row[0],
                    "en": row[1]
                },
                "trackers": []
            })

    print(data)


main()
