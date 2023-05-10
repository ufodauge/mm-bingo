import csv
import os


def main():
    path = os.path.dirname(__file__)
    data = []
    with open(path+'/tasklist.csv', 'r', encoding="utf-8") as f:
        reader = csv.reader(f)

        for row in reader:
            data.append({
                "difficulty": int(row[2]),
                "contents": {
                    "ja": row[0],
                    "en": row[1]
                },
                "trackers": []
            })

    with open(path+"/temp.txt", "w", encoding="utf-8") as f:
        f.write(str(data))


main()
