import { MeshNode } from '../types';

export class MeshNetworkService {
  private static MOCK_NODES: MeshNode[] = [
    { nodeId: 'node_ble_01', name: "Alex's Pixel 8 (Peer Relay)", signalStrengthDbm: -62, isRelayActive: true, batteryPercent: 88, distanceMeters: 4.2, queuedPackets: 2 },
    { nodeId: 'node_wifi_02', name: "Sarah's iPhone 15 Pro", signalStrengthDbm: -74, isRelayActive: true, batteryPercent: 64, distanceMeters: 11.5, queuedPackets: 0 },
    { nodeId: 'node_ble_03', name: "Transit Hub Mesh Relay #4", signalStrengthDbm: -88, isRelayActive: true, batteryPercent: 100, distanceMeters: 24.0, queuedPackets: 5 }
  ];

  public static getNearbyMeshNodes(): MeshNode[] {
    return this.MOCK_NODES;
  }

  public static simulateMeshRelaySend(messageText: string, recipientName: string): { hopPath: string[]; packetId: string } {
    return {
      hopPath: ["My Device (Local BLE)", "Alex's Pixel 8 (Hop 1)", "Sarah's iPhone (Hop 2)", `${recipientName}'s Device (Delivered)`],
      packetId: `MESH_PKT_${Math.floor(Math.random() * 89999 + 10000)}`
    };
  }
}
