using System.Text;
using System.Net;
using System.Net.Sockets;
using static System.Console;

class Program {
    public static void Main() {
        // Daten, die gesendet werden
        const string textToSend = "Hallo Welt";
        // Endpunkt, zu dem verbunden wird
        const string localhost = "127.0.0.1";
        const int port = 80;

        var data = Encoding.UTF8.GetBytes(textToSend);
        var ip = IPAddress.Parse(localhost);
        var ipEndPoint = new IPEndPoint(ip, port);

        // Socket, das verwendet wird
        using (var socket = new Socket(AddressFamily.InterNetwork,
                                       SocketType.Stream,
                                       ProtocolType.Tcp)) {
            // Es wird zum Endpunkt verbunden
            socket.Connect(ipEndPoint);
            // Daten werden gesendet
            var byteCount = socket.Send(data, SocketFlags.None);
            WriteLine("Es wurden {0} bytes gesendet", byteCount);
            // Puffer für die zu empfangenen Daten
            var buffer = new byte[256];
            // Daten werden empfangen
            byteCount = socket.Receive(buffer, SocketFlags.None);

            // Wenn eine Antwort erhalten wurde, diese ausgeben
            if (byteCount > 0) {
                WriteLine("Es wurden {0} Bytes empfangen", byteCount);
                var answer = Encoding.UTF8.GetString(buffer);
                WriteLine("Empfangene Daten: {0}", answer);
            }

            // Verbindung wird geschlossen
        }
    }
}