export default async function () {
  const token = Netlify.env.get("FOOTBALL_DATA_TOKEN_API");

  if (!token) {
    return Response.json(
      { error: "Football API token is not configured in Netlify." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.football-data.org/v4/matches",
      {
        headers: {
          "X-Auth-Token": token,
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: "Football provider error", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      updatedAt: new Date().toISOString(),
      matches: (data.matches || []).map(match => ({
        id: match.id,
        competition: match.competition?.name || "Football",
        homeTeam: match.homeTeam?.name || "Home",
        awayTeam: match.awayTeam?.name || "Away",
        homeScore: match.score?.fullTime?.home ?? null,
        awayScore: match.score?.fullTime?.away ?? null,
        status: match.status,
        utcDate: match.utcDate
      }))
    });
  } catch {
    return Response.json(
      { error: "Unable to contact football-data.org" },
      { status: 502 }
    );
  }
}
