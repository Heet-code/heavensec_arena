"""
Simulation compatibility module forwarding to modular package.
"""

from simulation.engine import start_simulation, cancel_simulation, run_simulation_loop
from simulation.agents import RedTeamAgent, BlueTeamSentinel, InvestigationAnalyst, ResponseCommander
from simulation.referee import RefereeAgent
from simulation.coach import CoachEngine
from simulation.scenarios import get_scenario, list_all_scenarios, SYNTHETIC_ENVIRONMENT
