package com.molveno.boatRent.controllers;

import com.molveno.boatRent.model.Boat;
import com.molveno.boatRent.model.Trip;
import com.molveno.boatRent.repositories.BoatRepository;
import com.molveno.boatRent.repositories.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/boats")//end point
public class BoatController {
    @Autowired//connect to database
    private BoatRepository boatRepository;
    @Autowired//connect to database
    private TripRepository tripRepository;

    @GetMapping
    public List<Boat> getBoats (){
        return boatRepository.findAll();
    }

    @PostMapping
    public String addBoat(@RequestBody Boat boat) {
        Boat existingBoat = boatRepository.findOneByBoatNumberIgnoreCase(boat.getBoatNumber());
        if(existingBoat != null) {
            return "The boat number "+ boat.getBoatNumber() + " is already exists. Please set another number.";
        }
        boatRepository.save(boat);
        return "The boat has added..";
    }
    @DeleteMapping("/{id}")
    void deleteBoat(@PathVariable Long id) {
        boatRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public void updateBoat(@PathVariable("id") Long id,  @RequestBody Boat boat){
        boat.setId(id);
        boatRepository.save(boat);
    }

    @PutMapping("/setActualPrice")
    public void setActualPrice(@RequestParam("actualPrice") Double actualPrice){
        List<Boat> boats = boatRepository.findAll();
        for (Boat boat : boats){
            boat.setActualPrice(actualPrice);
            boatRepository.save(boat);
        }
    }

    @PutMapping("/setMinPrice")
    public void setMinPrice(@RequestParam("minPrice") Double minPrice){
        List<Boat> boats = boatRepository.findAll();
        for (Boat boat : boats){
            boat.setMinPrice(minPrice);
            boatRepository.save(boat);
        }
    }



    @GetMapping("/suitableBoats")
    public String getSuitableBoats(@RequestParam("numOfPersons") Integer numOfPersons) {
        List<Integer> suitableNumberOfSeats = new ArrayList<>();

        String suitableBoatNumber ="";
        LocalDate today = LocalDate.now();
        //find all trips for today to check boats in use
        List<Trip> trips = tripRepository.findAllByStartDate(today);
        //load all boats to a list then find the boats in use and remove them to find boats not in use
        List<Boat> boatsNotInUse = new ArrayList<>(boatRepository.findAll());

        for (Trip trip : trips){
            if(trip.getStatus().equals("ongoing..")){
                boatsNotInUse.remove(trip.getBoat());
            }
        };
        //check if exact match available and return otherwise add all boat seat numbers bigger than numOfPersons to a list
        for (Boat boat: boatsNotInUse) {
            if(boat.getNumberOfSeats().equals(numOfPersons)){
               return  boat.getBoatNumber();
            }else {
                if (boat.getNumberOfSeats() > numOfPersons) {
                    suitableNumberOfSeats.add(boat.getNumberOfSeats());
                }
            }
        }
        //if there are multiple suitable boats find the one with number of seats closest to the number of persons
        if(suitableNumberOfSeats.isEmpty()){
            return "There is no suitable boat...";
        }else{
            Integer minimumValue = suitableNumberOfSeats.get(0);
            // find minimum value in array java
            for(int a = 1; a < suitableNumberOfSeats.size(); a++)
            {
                if(suitableNumberOfSeats.get(a) < minimumValue)
                {
                    minimumValue = suitableNumberOfSeats.get(a);
                }
            }
            for (Boat boat: boatRepository.findAll()) {
                if (boat.getNumberOfSeats().equals(minimumValue)) {
                    suitableBoatNumber = boat.getBoatNumber();
                    break;
                }
            }
        }

       return suitableBoatNumber;
    }
}
