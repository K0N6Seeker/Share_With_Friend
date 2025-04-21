import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'earthquake_bloc.dart';
import 'earthquake_repository.dart';
import 'earthquake_state.dart';

class EarthquakePage extends StatelessWidget {
  const EarthquakePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => EarthquakeBloc(EarthquakeRepository()),
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.blueAccent,
          title: Text(
            'Live Earthquake Feed from USGS: kongpob laohapipatchai/231 (21 April 2568)',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
          ),
          centerTitle: true,
        ),
        body: BlocBuilder<EarthquakeBloc, EarthquakeState>(
          builder: (context, state) {
            if (state is EarthquakeLoading) {
              return Center(child: CircularProgressIndicator());
            } else if (state is EarthquakeLoaded) {
              debugPrint(state.lastUpdated.toLocal().toString());
              return Padding(
                padding: const EdgeInsets.all(10.0),
                child: Column(
                  children: [
                    SizedBox(height: 10),
                    Text(
                      'Last updated: ${state.lastUpdated.toLocal()} (every 30 seconds)',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 10),
                    createListView(state),
                  ],
                ),
              );
            } else if (state is EarthquakeError) {
              return Center(child: Text(state.message));
            } else {
              return Center(child: Text("Waiting for data..."));
            }
          },
        ),
      ),
    );
  }

  Widget createListView(EarthquakeLoaded state) {
    return Expanded(
      flex: 8,
      child: ListView.separated(
        separatorBuilder: (context, index) => Divider(color: Colors.black),
        itemCount: state.earthquakes.length,
        itemBuilder: (_, i) {
          final q = state.earthquakes[i];
          return ListTile(
            leading: CircleAvatar(
              radius: 50,
              backgroundColor: q.magnitude < 4.5 ? Colors.green : Colors.red,
              child: Text('${q.magnitude}'),
            ),
            title: Text(q.place),
            subtitle: Text("Magnitude: ${q.magnitude}"),
            trailing: Text(
              DateTime.fromMillisecondsSinceEpoch(q.time).toLocal().toString(),
              style: TextStyle(fontSize: 12),
            ),
          );
        },
      ),
    );
  }
}
