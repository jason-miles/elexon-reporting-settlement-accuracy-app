"""
Generate synthetic half-hourly consumption and MPAN-like IDs for demo.
No real MPANs; format similar to UK MPAN (e.g. fake 13-digit id).
Run in Databricks or locally to produce CSV/Parquet for 00_setup or 01_ingest_bronze.
"""
import random
from datetime import datetime, timedelta
from pathlib import Path

# MPAN-like: 13 digits, fake (no real MPANs)
def fake_mpan(household_id: int) -> str:
    base = 2000000000000 + (household_id % 10_000_000_000)
    return str(base).zfill(13)


def generate_row(household_id: int, ts: datetime, base_kwh: float = 0.5) -> dict:
    # Add some variance and time-of-day effect
    hour = ts.hour + ts.minute / 60
    daily_factor = 0.5 + 0.5 * (1 + (hour - 14) ** 2 / 100)  # peak afternoon
    kwh = max(0.01, round(base_kwh * daily_factor * (0.8 + 0.4 * random.random()), 4))
    return {
        "household_id": household_id,
        "mpan_id": fake_mpan(household_id),
        "interval_start_ts": ts.isoformat(),
        "kwh": kwh,
    }


def generate_csv(out_path: str, num_households: int = 500, days: int = 14) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    start = datetime(2024, 1, 1, 0, 0, 0)
    interval = timedelta(minutes=30)
    with open(out_path, "w") as f:
        f.write("household_id,mpan_id,interval_start_ts,kwh\n")
        for d in range(days):
            for hh in range(num_households):
                for half_hour in range(48):
                    ts = start + timedelta(days=d) + half_hour * interval
                    row = generate_row(hh, ts)
                    f.write(f"{row['household_id']},{row['mpan_id']},{row['interval_start_ts']},{row['kwh']}\n")


if __name__ == "__main__":
    generate_csv("data/synthetic/consumption_sample.csv", num_households=200, days=7)
