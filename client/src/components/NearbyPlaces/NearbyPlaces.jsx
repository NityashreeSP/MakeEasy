import PlaceCard from "../PlaceCard/PlaceCard";

function NearbyPlaces({ places, onSelectPlace }) {

    return (
        <div style={{ marginTop: "30px" }}>

            <h2>
                Nearby Places ({places.length})
            </h2>

            {places.length === 0 ? (
                <p>No nearby places found.</p>
            ) : (
                places.map((place) => (
                    <PlaceCard
                        key={place.id}
                        place={place}
                        onSelectPlace={onSelectPlace}
                    />
                ))
            )}

        </div>
    );
}

export default NearbyPlaces;