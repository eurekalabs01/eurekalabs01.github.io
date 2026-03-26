#!/bin/bash
# ============================================================================
#  download-labs.sh
#
#  Downloads all lab PDFs and images from eurekalabs.net into local folders.
#  Run this once from the root of your GitHub Pages repo.
#
#  Usage:
#    chmod +x download-labs.sh
#    ./download-labs.sh
#
#  After running, you'll have:
#    labs/
#      wep-passive/
#        eavesdropping.jpg       (lab image)
#        WepCrackBasic.pdf       (lab manual)
#      wep-active/
#        inject.jpg
#        WepCrackAdvanced.pdf
#      ...
#
#  You can then add any additional materials (datasets, code, etc.)
#  to each lab's subfolder.
# ============================================================================

BASE="https://eurekalabs.net"

# Format: lab-id|oldId|imageFile|pdfFile
LABS="
wep-passive|5f305aa60599dd0208c670fb|eavesdropping.jpg|WepCrackBasic.pdf
wep-active|5f305b750599dd0208c670fc|inject.jpg|WepCrackAdvanced.pdf
wpa-handshake|5f305d790599dd0208c670fd|handshake.png|WPAPSKCrack.pdf
wps-unlock|5f3061430599dd0208c670fe|wps.png|WPSCrack.pdf
wpa2-enterprise|5f3069b10599dd0208c670ff|wpa2-enterprise.png|WPA2-Enterprise_Buffalo.pdf
mobile-platform|5f306fbf0599dd0208c67100|platform.png|00_platform.pdf
hide-and-seek|5f30ab3f0599dd0208c67103|ssid-hiding.jpg|hide-and-seek.pdf
mischievous-mac|5f30d3920599dd0208c67104|csma.png|00_mac.pdf
evil-twin|5f34150e0599dd0208c67106|evil-twin.png|00_Evil_Twin.pdf
passing-passwords|606a1c030599dd07e0d3c52e|passing-on-passwords.png|00_Authentication.pdf
xss|6094a6a30599dd07e0d3c52f|xss.jpeg|xss.pdf
take-my-coin|6094a9d50599dd07e0d3c530|bitcoin.jpeg|Take_My_Coin.pdf
identity-demystified|60957ca80599dd07e0d3c531|digital-certificates.png|Identity_Demystified.pdf
crypto-flickered|6095800e0599dd07e0d3c532|hash-extension.png|Crytpo_Flickered.pdf
bleeding-heart|609de7ec0599dd07e0d3c533|heartbleeding.jpeg|bleeding-heart.pdf
not-so-personal-data|60a052ae0599dd07e0d3c534|not-so-personal.jpeg|GAP.pdf
invisible-surfing|60a9a3130599dd06f44504be|invisible-surfing.jpeg|Invisioble_Surfing.pdf
shell-shattered|60c50a2b0599dd2217d95944|Shellshock-bug.png|Shattered_Shell.pdf
leaky-database|60c584850599dd2217d95945|sql-injection.jpeg|Leaky_Database.pdf
poodle|60c63b0b0599dd2217d95946|poodle.jpeg|Poodle_Bites.pdf
intruder-hunt|60c7e7100599dd069cb7cb71|intruder-hunt.png|Intruder_Hunt.pdf
walls-have-ears|60dbb1f60599dd069cb7cb72|walls-have-ears.png|Walls-Have-Ears.pdf
video-aficionado|60e737670599dd069cb7cb74|video-aficionado.png|Video-Aficionado.pdf
one-pixel-attack|60ec4e340599dd069cb7cb75|one-pixel-attack.jpeg|OnePixelAttack.pdf
wpa3-dragonfly|60ed202f0599dd069cb7cb76|dragonblood.jpeg|00-wpa3-sae.pdf
enhanced-open|6106d0570599dd06d5706ea1|wpa3-owe.png|wpa3-owe.pdf
wpa-pmkid|6109e0d20599dd06d5706ea2|PMKID-attack.png|WPA-PSK-PMKID.pdf
zombie-apocalypse|610f0e230599dd06d5706ea3|zombie-apocalypse.jpeg|00_DoS_Attacks.pdf
ethereum|6417e25b0599dd7693f06ffa|Ethereum.png|Ethereum-Main.pdf
kerberos|641bcbcb0599dd141991706f|Kerberos.gif|Kerberos.pdf
toadally-safe-password|646d63c80599dd1419917071|toadally_safe_password.png|00toadallySafe.pdf
ransomwhale|64adf8710599dd1419917072|rw_whale.png|00_Ransomware.pdf
"

echo "=========================================="
echo "  Eureka Labs — Downloading lab files"
echo "=========================================="
echo ""

SUCCESS=0
FAIL=0

echo "$LABS" | while IFS='|' read -r labId oldId imageFile pdfFile; do
  # Skip empty lines
  [ -z "$labId" ] && continue

  DIR="labs/$labId"
  mkdir -p "$DIR"

  # Download image
  IMG_URL="$BASE/icon/$oldId/$imageFile"
  if [ ! -f "$DIR/$imageFile" ]; then
    echo "  [$labId] Downloading image: $imageFile"
    curl -sS -f -o "$DIR/$imageFile" "$IMG_URL" 2>/dev/null
    if [ $? -ne 0 ]; then
      echo "    WARNING: Failed to download $IMG_URL"
      FAIL=$((FAIL + 1))
    else
      SUCCESS=$((SUCCESS + 1))
    fi
  else
    echo "  [$labId] Image already exists: $imageFile"
  fi

  # Download PDF
  PDF_URL="$BASE/lab_manual/$oldId/$pdfFile"
  if [ ! -f "$DIR/$pdfFile" ]; then
    echo "  [$labId] Downloading PDF:   $pdfFile"
    curl -sS -f -o "$DIR/$pdfFile" "$PDF_URL" 2>/dev/null
    if [ $? -ne 0 ]; then
      echo "    WARNING: Failed to download $PDF_URL"
      FAIL=$((FAIL + 1))
    else
      SUCCESS=$((SUCCESS + 1))
    fi
  else
    echo "  [$labId] PDF already exists: $pdfFile"
  fi

  echo ""
done

echo "=========================================="
echo "  Done! Check the labs/ folder."
echo "=========================================="
echo ""
echo "Folder structure:"
echo "  labs/"
ls -d labs/*/ 2>/dev/null | head -5
echo "  ..."
echo ""
echo "You can now add additional materials to each lab's subfolder."
echo "Commit and push to deploy."
