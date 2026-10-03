"""Build the primary Open Sosaria browser milestone."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("build-native.py")),run_name="__main__")
